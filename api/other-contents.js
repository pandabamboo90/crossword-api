module.exports = function (app, router, pool, _u, appFunction, globalSettings, email, apn, fastCSV, path, fs, log){

    var knex = app.get("knex"),
        Promise = app.get("Promise");

    /* GET OTHER CONTENTS [ AGREEMENT / QA LIST / MANUAL ]
     * ====================================================================== */
    
    router.get("/:contentType", function(req, res){
        var contentType = req.params["contentType"];

        knex.select("*")
            .from("other_content")
            .where("type", contentType)
            .then(function(_result){
                var result = appFunction.convertQueryResultData(_result);
                res.json(result)
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });



    /* UPDATE OTHER CONTENTS [ AGREEMENT / QA LIST / MANUAL ]
     * ====================================================================== */
    
    router.put("/:contentType", function(req, res){
        var requestBody = req.body,
            contentType = req.param("contentType"),
            updateFields = {
                content : requestBody.content
            };

        knex("other_content")
            .update(updateFields)
            .where("type", contentType)
            .then(function(_result){
                var result = {
                    data : requestBody,
                    message : globalSettings.message.update
                }

                res.json(result);
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });
    
};