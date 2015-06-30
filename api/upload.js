module.exports = function(app, router, _u, appFunction, globalSettings, fastCSV, path, fs, log, busboy, express){

    /* UPLOAD CSV
     * ====================================================================== */

    router.post("/csv/:dataType", function(req,res){

        var busboyObj = new busboy({ headers: req.headers }),
            dataType = req.params["dataType"],
            writePath = "";

        busboyObj.on("file", function(fieldname, file, filename, encoding, mimetype) {
            if(dataType == "game-data"){
                filename = "game-data_" + filename;
            }else if(dataType == "reward-info"){
                filename = "reward-info_" + filename;
            }
            //console.log(fieldname, file, filename, encoding, mimetype);

            // TODO : Accept only CSV file !
            if(filename.split(".").pop() === "csv"){
                writePath = globalSettings.rootFolder + globalSettings.csvUploadFolder +  appFunction.getFullDateTime() + "_" + decodeURIComponent(filename);
                file.pipe(fs.createWriteStream(writePath));
                file.on("end", function(){
                    console.log("file end")
                })
            }else{
                res.status(400).send({
                    type : "error",
                    message : "Failed to upload ! This not a CSV file."
                });
            }
        });

        busboyObj.on("finish", function() {
            console.log("==== BUSBOY FINISHED");

            // Create a read stream to read CSV file
            var readStream = fs.createReadStream(writePath);

            if(dataType == "game-data"){
                var gameData = {
                    questions : [],
                    answers : []
                };

                fastCSV
                    .fromStream(readStream, {
                        headers : true // expect the first line csv to be headers, convert [array] -> {object}
                    })
                    .validate(function(data){
                        // TODO : Do something to check data in CSV file ! But now we just get the data.
                        return data
                    })
                    .on("data-invalid", function(data){
                        // TODO : Do something with the invalid data
                    })
                    .on("record", function(data){
                        var values = _u.values(data);

                        // Push data to gameData Obj
                        gameData.questions.push(values[0]);
                        gameData.answers.push(values[1]);
                    })
                    .on("end", function(){
                        // Finished reading CSV file
                        var result = {
                            gameData : gameData,
                            type : "success",
                            message : "Game data upload successfully."
                        };

                        res.send(result);
                    });
            }else if(dataType == "reward-info"){
                var rewardInfo = {
                    rewardTitle: null,
                    rewardThumb: null,
                    rewardDescription: null,
                    dateEndOfAttending: '',
                    dateSweepstakes: '',
                    quantity: 0,
                    isPremium: 0
                };

                fastCSV
                    .fromStream(readStream, {
                        headers : true // expect the first line csv to be headers, convert [array] -> {object}
                    })
                    .validate(function(data){
                        // TODO : Do something to check data in CSV file ! But now we just get the data.
                        return data
                    })
                    .on("data-invalid", function(data){
                        // TODO : Do something with the invalid data
                    })
                    .on("record", function(data){
                        _u.each(data, function(v, k){
                            console.log(k, v);

                            if(k.indexOf("date") != -1){
                                v = Date.parse(v).toString(globalSettings.MySQLDateFormatOnlyDate)
                            }else if(k.indexOf("rewardType") != -1 && v === "premium"){
                                rewardInfo.isPremium = 1
                            }

                            if(!(k.indexOf("rewardType") != -1))
                                rewardInfo[k] = v
                        });
                    })
                    .on("end", function(){
                        // Finished reading CSV file
                        var result = {
                            rewardInfo : rewardInfo,
                            type : "success",
                            message : "Reward info upload successfully."
                        };

                        res.json(result);
                    });
            }
        });
        return req.pipe(busboyObj);

    });



    /* UPLOAD REWARD THUMBNAIL
     * ====================================================================== */

    router.post("/upload/reward-thumbnail", function(req,res){
        var busboyObj = new busboy({ headers: req.headers }),
            pathToRewardsThumbnail = "";

        busboyObj.on("file", function(fieldname, file, filename, encoding, mimetype) {
            // TODO : Accept only Image file !
            if(mimetype.indexOf("image") != -1){
                pathToRewardsThumbnail = globalSettings.rewardThumbFolder + appFunction.getFullDateTime() + "_" + decodeURIComponent(filename);

                file.pipe(fs.createWriteStream(globalSettings.rootFolder + pathToRewardsThumbnail));
            }else{
                res.send(400, {
                    type : "error",
                    message : "Failed to upload ! This is not an image."
                });
            }
        });
        busboyObj.on("finish", function() {
            var thumbnailUrl = req.headers.host + pathToRewardsThumbnail;
            thumbnailUrl = req.secure ? "https://" + thumbnailUrl : "http://" + thumbnailUrl;

//            console.log(thumbnailUrl);
            res.json({
                rewardThumb : thumbnailUrl
            });
        });
        return req.pipe(busboyObj);
    });



    /* Static files
     * ====================================================================== */

    app.use(express.static(path.join(__dirname, "uploads")));            // Serve Image, CSV files for client
    app.get("/uploads/*", function(req, res){
        var filePath = path.resolve(globalSettings.rootFolder + decodeURIComponent(req.originalUrl));
        fs.exists(filePath, function (exists) {
            if (!exists) {
                // 404 missing files
                res.send(404, {
                    type : "error",
                    message : '404 Not Found'
                });
            }else{
                if(path.extname(req.originalUrl) === ".csv"){
                    res.download(filePath, path.basename(req.originalUrl), function(){
                        // Delete the tmp file
                        fs.unlink(filePath);
                    });
                }else{
                    res.sendfile(path.resolve(globalSettings.rootFolder + decodeURIComponent(req.originalUrl)));
                }
            }
        });
    });
};
