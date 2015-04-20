module.exports = function(app, router, jwt, _u, appFunction, globalSettings, pool){

    var knex = app.get("knex"),
        Promise = app.get("Promise"),
        bcrypt = app.get("bcrypt");

    router.post("/authenticate", function(req, res){
        var requestBody = req.body,
            nickname = requestBody.nickname,
            password = requestBody.password,
            rememberMe = requestBody.rememberMe ? 1 : 0;

        if (!nickname || !password) throw new Error(globalSettings.errorMessage.usernameAndPasswordRequire);

        var admin = null;
        knex.select("*")
            .from("admins")
            .where({
                nickname : nickname
            })
            .then(function(_admin){
                admin = appFunction.convertQueryResultData(_admin)[0];
                if(!admin) throw Error(globalSettings.errorMessage.wrongPassword);

                admin.rememberMe = rememberMe;
                return knex("admins")
                    .update({
                        remember_me : rememberMe
                    })
                    .where({
                        admin_id : admin.adminId
                    })
            })
            .then(function(){
                return bcrypt.compareAsync(password, admin.password);
            })
            .then(function(matched){
                if(!matched) throw Error(globalSettings.errorMessage.wrongPassword);

                // Create a new token for user
                var token = jwt.sign(admin, app.get("SECRET"), {
                    expiresInMinutes: 129600 // 3 months
//                    expiresInMinutes: 1 // 10 years
                });

                res.json({
                    user : _u.omit(admin, "password"),
                    token : token
                });
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });

    /*
     * [ MOBILE ] - USER REGISTER
     */

    router.post("/register", function(req, res){
        var requestBody = req.body,
            tmpCoinValue = requestBody.introUserCoinGet;
            requestBody.introUserCoinGet = 0;

        var requestParameters = appFunction.convertRequestDataToUnderscore(requestBody),
            insertedUserId = 0;

        knex.transaction(function(trx){
            return trx("users")
                .insert(requestParameters)
                .then(function(_result){
                    insertedUserId = _result[0]

                    /*
                     TODO : Check user has been introduced by another user or not ? then +coin for intro user
                     */

                    if(_u.isNumber(parseInt(requestBody.introUserId)) && requestBody.introUserId > 0){
                        return trx("users")
                            .increment("intro_user_coin_get", tmpCoinValue)
                            .where("user_id", requestBody.introUserId)
                    }

                    return Promise.resolve()
                })
        })
        .then(function(_obj) {
            console.log("==== [MOBILE] USER ID " , insertedUserId , " REGISTER SUCCESSFULLY");
            return knex.select("*")
                .from("users_list_view")
                .where("user_id", insertedUserId);
        })
        .then(function(_result){
            var result = appFunction.convertQueryResultData(_result)[0];

            // Set device type to detect mobile or desktop
            result.deviceType = "mobile";
            result.deviceOs = requestBody.deviceOs;

            // Create a new token for user
            result.token = jwt.sign(result, app.get("SECRET"), {
                    expiresInMinutes: 5256000 // 10 years
                }
            );

            res.json(result);
        })
        .catch(function(err) {
            // If we get here, that means that neither the 'Old Books' catalogues insert,
            // nor any of the books inserts will have taken place.
            res.send(400, { message : err.toString() });
        });
    });



    /*
     * [ MOBILE ] - RENEW TOKEN
     */

    router.post("/renew-token", function(req, res){
        var requestBody = req.body;

        knex.select("*")
            .from("users")
            .where({
                user_id : requestBody.userId,
                device_token : requestBody.deviceToken
            })
            .andWhere("status", ">" , 0)
            .then(function(_result){
                var result = appFunction.convertQueryResultData(_result)[0];

                if(result){
                    // Set device type to detect mobile or desktop
                    result.deviceType = "mobile";

                    // Create a new token for user
                    result.token = jwt.sign(result, app.get("SECRET"),{
                            expiresInMinutes: 5256000 // 10 years
                        }
                    );

                    res.json(result);
                }else{
                    return Promise.reject(globalSettings.errorMessage.userDisabled)
                }
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });
};