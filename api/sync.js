module.exports = function(app, router, pool, _u, appFunction, globalSettings, email, apn, fastCSV, path, fs){

    var knex = app.get("knex"),
        Promise = app.get("Promise");

    /* ===========================================================================
     * === SYNC GAMES DATA WITH MOBILE
     * ========================================================================= */

//    router.post("/sync/:userId", function(req, res){
//        var userId = req.params["userId"],
//            requestBody = req.body,
//            lastGameId = requestBody.maxGameId,
//            requestParameters = {
//                usersGames : [],
//                user : {}
//            };
//
//        // Change the request parameters from camelCase to underscore for matching with DB column names
//        _u.each(requestBody.usersGames, function(v, k){
//            requestParameters.usersGames[k] = {};
//
//            _u.each(_u.keys(v), function(v1){
//                var keyName = appFunction.camelCaseToUnderscore(v1).toLowerCase();
//                requestParameters.usersGames[k][keyName] = requestBody.usersGames[k][v1];
//            });
//        });
//
//        pool.getConnection(function(err, connection) {
//            if (err) throw err;
//
//            connection.beginTransaction(function(err) {
//                if (err) throw err;
//
//                /* ========= START SYNCED [ Users & Games ]
//                 * ================================================================================= */
//
//                if(requestParameters.usersGames.length > 0){
//                    var usersGames = requestParameters.usersGames,
//                        gameIdList = [];
//
//
//                    // Filter out the game_id from the game list
//                    _u.each(_u.pluck(usersGames, "game_id"), function(v, k){
//                        gameIdList[k] = parseInt(v)
//                    });
//
//                    var sqlQuery = "select game_id from users_games where user_id = ? and game_id in (" + gameIdList.join(",") + ")";
//
//                    // Get the existed game_id from the table
//                    connection.query(sqlQuery, [userId], function(err, rows) {
//                        if (err) {
//                            connection.rollback(function() {
//                                throw err;
//                            });
//                        }
//
//                        var gameIdExisted = [];
//                        console.log(rows)
//
//                        // Records existed in table ---> UPDATE these records
//                        if(rows.length > 0){
//                            gameIdExisted = _u.pluck(rows, "game_id");
//                            var sqlUpdate = "update users_games set ? where user_id = ? and game_id = ?";
//
//                            // Loop through the existed list, UPDATE records
//                            _u.each(gameIdExisted, function(v, k){
//                                var updateData = _u.pick(_u.find(usersGames, function(v1, k1){
//                                    return v1.game_id == v
//                                }), "times_played", "times_solved");
//
//                                console.log(updateData);
//
//
//                                connection.query(sqlUpdate, [updateData, userId, v], function(err, rows){
//                                    if (err) {
//                                        connection.rollback(function() {
//                                            throw err;
//                                        });
//                                    }
//                                });
//                            });
//                        }
//
//                        // Records didn't exist in table ---> INSERT new records
//                        var gameIdNotExsited = _u.difference(gameIdList, gameIdExisted);
//                        var sqlInsert = "insert into users_games set ?";
//
//
//                        // Loop through the 'not existed' list, INSERT records
//                        _u.each(gameIdNotExsited, function(v, k){
//                            var insertData = _u.find(usersGames, function(v1){
//                                return v1.game_id == v
//                            });
//
//
//                            connection.query(sqlInsert, [insertData, userId, v], function(err, rows){
//                                if (err) {
//                                    connection.rollback(function() {
//                                        throw err;
//                                    });
//                                }
//                            });
//                        });
//                    });
//
//
//                    // Everything is OK ! Commit !
//                    connection.commit(function(err) {
//                        if (err) {
//                            connection.rollback(function() {
//                                throw err;
//                            });
//                        }
//                    });
//                }
//
//                /* ######### FINISHED SYNCED [ Users & Games ]
//                 * ################################################################################# */
//
//
//
//                /* ========= START Send back game list and + coins for user introduced
//                 * ================================================================================= */
//
//                var sqlGetLatestGameList =
//                        "SELECT " +
//                            "* " +
//                        "FROM " +
//                            "games_list_view gl " +
//                        "WHERE " +
//                            "gl.is_public = 1 " +
//                            "and gl.game_id > ? " +
//                        "ORDER BY " +
//                            "gl.game_id desc",
//                    result = {
//                        gamesList : [],
//                        user : {}
//                    };
//
//                connection.query(sqlGetLatestGameList, [lastGameId], function(err, rows) {
//                    if (err) throw err;
//
//                    // Get game list
//                    result.gamesList = appFunction.convertQueryResultData(rows);
//
//
//                    /* ========= UPDATE USER INFO
//                     * ================================================================================= */
//
////                    requestBody.user.ticketsQuantity = 200;
////                    requestBody.user.ticketsQuantityPremium = 200;
//
//                     var normalFields = [
//                            "email",
//                            "realname",
//                            "address",
//                            "phone",
//                            "notify_flag",
//                            "facebook",
//                            "twitter",
//                            "google",
//                            "games_downloaded",
//                            "coins_quantity",
//                            "tickets_quantity",
//                            "tickets_quantity_premium",
//                            "language"
//                        ],
//                        dateFields = [
//                            "date_last_accessed",
//                            "date_review_confirm_appear",
//                            "date_submit_review",
//                            "date_get_daily_coins"
//                        ],
//                        userParameters = appFunction.convertRequestDataToUnderscore(requestBody.user),
//                        updateNormalFields = _u.pick(userParameters, normalFields),
//                        updateDateFields = _u.pick(userParameters, dateFields);
//
//                     // Update normal fields
//                     var sqlUpdateNormalFields = "update users set ? where user_id = ?";
//
//                     connection.query(sqlUpdateNormalFields, [updateNormalFields, userId] , function(err, rows) {
//                         if (err) {
//                             connection.rollback(function() {
//                                 throw err;
//                             });
//                         }
//
//                         // If date field available to update
//                         if(_u.size(updateDateFields) > 0){
//                             // After success update normal fields, update date fields
//                             var sqlUpdateDateFields = "update users set " + appFunction.prepareUpdateDateQuery(updateDateFields, req.user.deviceType) + " where user_id = ?";
//
//                             connection.query(sqlUpdateDateFields, [userId], function(err, rows) {
//                                 if (err) {
//                                     connection.rollback(function() {
//                                         throw err;
//                                     });
//                                 }
//                             });
//                         }
//
//
//                         // Everything is OK ! Commit !
//                         connection.commit(function(err) {
//                             if (err) {
//                                 connection.rollback(function() {
//                                     throw err;
//                                 });
//                             }
//                         });
//                     });
//
//
//
//                    /* ========= UPDATE BONUS COINS FOR THIS USER
//                     * ================================================================================= */
//
//                    // Update bonus coin to 0
//                    var sqlUpdateIntroUserCoinGet = "update users set coins_quantity = (coins_quantity + intro_user_coin_get), intro_user_coin_get = 0 where user_id = ?";
//
//                    connection.query(sqlUpdateIntroUserCoinGet, [userId], function(err, rows) {
//                        if (err) {
//                            connection.rollback(function() {
//                                throw err;
//                            });
//                        }
//
//
//                        // Send back user information & latest game list for client
//                        var sqlQuery = "select * from users_list_view where user_id = ?";
//
//                        connection.query(sqlQuery, [userId], function(err, rows) {
//                            if (err) {
//                                connection.rollback(function() {
//                                    throw err;
//                                });
//                            }
//
//                            result.user = appFunction.convertQueryResultData(rows)[0];
//
//
//                            // Everything is OK ! Commit !
//                            connection.commit(function(err) {
//                                if (err) {
//                                    connection.rollback(function() {
//                                        throw err;
//                                    });
//                                }
//                            });
//
//                            res.json(result);
//                        });
//                    });
//                });
//            });
//
//            connection.release();
//        });
//    });




    router.post("/sync/:userId", function(req, res){
        var userId = req.params["userId"],
            requestBody = req.body,
//            lastGameId = requestBody.maxGameId,
            requestParameters = {
                usersGames : [],
                user : {}
            },
            result = {
                gamesList : [],
                user : {}
            };

        // Change the request parameters from camelCase to underscore for matching with DB column names
        _u.each(requestBody.usersGames, function(v, k){
            requestParameters.usersGames[k] = {};

            _u.each(_u.keys(v), function(v1){
                var keyName = appFunction.camelCaseToUnderscore(v1).toLowerCase();
                requestParameters.usersGames[k][keyName] = requestBody.usersGames[k][v1];
            });
        });

        var usersGames = requestParameters.usersGames,
            gameIdList = [];

        if(requestParameters.usersGames.length > 0){

            // Filter out the game_id from the game list
            _u.each(_u.pluck(usersGames, "game_id"), function(_gameId, k){
                gameIdList[k] = parseInt(_gameId)
            });

            knex.select("game_id")
                .from("users_games")
                .where({
                    user_id : userId
                })
                .whereIn("game_id", gameIdList)
                .then(function(_result){
                    // Records existed in table ---> UPDATE these records
                    var gameIdExisted = _u.pluck(_result, "game_id");

                    knex.transaction(function(trx){
                        // Loop through the existed list, UPDATE all records [Wait for all update query run successfully]
                        return Promise.all(_u.each(gameIdExisted, function(_gameId, k){
                            var updateData = _u.pick(_u.find(usersGames, function(_objUsersGames, k1){
                                return _objUsersGames["game_id"] == _gameId
                            }), "times_played", "times_solved");

                            trx("users_games")
                                .update(updateData)
                                .where({
                                    user_id: userId,
                                    game_id: _gameId
                                })
                                .then(function(_rows){
                                    console.log("==== SYNC : USERS_GAME UPDATED ---- GAME_ID : ", _gameId)
                                    //return Promise.resolve();
                                })
                        }))
                        .then(function(){
                            //Records didn't exist in table ---> INSERT new records
                            var gameIdNotExsited = _u.difference(gameIdList, gameIdExisted);
                            if(gameIdNotExsited.length > 0){
                                var insertData = [];

                                // Loop through the 'not existed' list, INSERT records
                                _u.each(gameIdNotExsited, function(_gameId, k){
                                    console.log("gameIdNotExsited : ----- ", _gameId);

                                    insertData[k] = _u.find(usersGames, function(_objUsersGames){
                                        return _objUsersGames["game_id"] == _gameId
                                    });
                                });

                                return trx("users_games")
                                    .insert(insertData)
                            }
                        })
                    })
                    .then(function(_rows){
                        console.log("==== SYNC : SYNC GAME DATA FINISHED !");
                    })
                    .catch(function(err) {
                        res.status(400).send({ message : err.toString() });
                    });
                });
        }

//        knex.select("*")
//            .from("games_list_view")
//            .where({
//                "is_public" : 1
//            })
//            .andWhere("game_id", ">", lastGameId)
//            .orderBy("game_id", "desc")
//            .then(function(_gameList){
//                // game list fetched !
//                console.log("==== SYNC : NEW GAME LIST FETCHED [ONLY PUBLIC GAME]");
//                result.gamesList = appFunction.convertQueryResultData(_gameList);


            var normalFields = [
                    "nickname",
                    "email",
                    "realname",
                    "address",
                    "phone",
                    "notify_flag",
                    "facebook",
                    "twitter",
                    "google",
                    "intro_user_id",
                    "games_downloaded",
                    "coins_quantity",
                    "tickets_quantity",
                    "tickets_quantity_premium"
                ],
                dateFields = [
                    "date_created",
                    "date_last_accessed",
                    "date_review_confirm_appear",
                    "date_submit_review",
                    "date_get_daily_coins"
                ],
                userParameters = appFunction.convertRequestDataToUnderscore(requestBody.user),
                updateNormalFields = _u.pick(userParameters, normalFields),
                updateDateFields = _u.pick(userParameters, dateFields);

//            return knex.transaction(function(trx){
            knex.transaction(function(trx){
                return trx("users")
                    .update(updateNormalFields)
                    .where("user_id", userId)
                    .then(function(_row){
                        if(_u.size(updateDateFields) > 0)
                            return trx.raw("update users set " + appFunction.prepareUpdateDateQuery(updateDateFields, req.user.deviceType) + " where user_id = ?", req.params["userId"]);
                    })
            })
//            })
            .then(function(_updatedUser) {
                console.log("==== SYNC : USER INFORMATION UPDATED");

                return knex.raw("update users set coins_quantity = (coins_quantity + intro_user_coin_get), intro_user_coin_get = 0 where user_id = ?", [userId])
            })
            .then(function(_updatedCoinQuantity){
                console.log("==== SYNC : USER COINS UPDATED");

                return knex.select("*")
                    .from("users_list_view")
                    .where("user_id", userId)
            })
            .then(function(_userInfo){
                console.log("==== SYNC : SEND BACK USER INFO FOR CLIENT AND GAME LIST");
                result.user = appFunction.convertQueryResultData(_userInfo)[0];

                res.json(result);
            })
            .catch(function(err) {
                res.send(400, { message : err.toString() });
            });

    });
};