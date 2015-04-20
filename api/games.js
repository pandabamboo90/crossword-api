module.exports = function(app, router, _u, appFunction, globalSettings, log){

    var knex = app.get("knex"),
        Promise = app.get("Promise");
    
    
    /* SEARCH GAMES
     * ====================================================================== */

    router.get("/games", function(req, res){
        // Only show public games for mobile users
        if(req.user && req.user.deviceType == "mobile")
            req.query.isPublic = 1;

        var requestQuery = req.query,
            requestParameters = appFunction.convertRequestDataToUnderscore(requestQuery),
            objSearchSQL = appFunction.buildSQLSearchQuery(requestParameters),
            currentPage = requestQuery.currentPage ? parseInt(requestQuery.currentPage) : 1,
            result = {
                pagination : {},
                data : [],
                message : ""
            };

        objSearchSQL.orderBy = requestQuery.orderBy ? appFunction.camelCaseToUnderscore(requestQuery.orderBy) : "game_id";
        objSearchSQL.orderDirection = requestQuery.orderDirection === undefined ? "desc" : (requestQuery.orderDirection ? "asc" : "desc");

        knex.count("* as totalRowCount")
            .from("games")
            .whereRaw(objSearchSQL.sqlWhere, objSearchSQL.whereParams)
            .then(function(_result){
                var totalRowCount = _u.values(_result[0])[0];

                if(requestQuery.currentPage)
                    result.message = globalSettings.message.foundRecords(totalRowCount);

                if(totalRowCount > 0){
                    if(req.user.deviceType == "mobile" || requestQuery.isMobileDebug){
                        result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount, globalSettings.pagination.mobile.maxPagesPerQuery, globalSettings.pagination.mobile.rowsPerPage);
//                        result.pagination.startRow = 0;
//                        result.pagination.maxRowsPerQuery = totalRowCount;
                    }else{
                        result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount);
                    }

//                    var subQuery =
//                        knex.select("game_id as tmp_game_id")
//                            .from("games")
//                            .whereRaw(objSearchSQL.sqlWhere, objSearchSQL.whereParams)
//                            .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
//                            .offset(result.pagination.startRow)
//                            .limit(result.pagination.maxRowsPerQuery)
//                            .as("tmp");
//
//
//                    knex.select("*")
//                        .from("games_list_view")
//                        .join(subQuery, "game_id", "=", "tmp_game_id")
//                        .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
//                        .then(function(_result){
//                            result.data = appFunction.convertQueryResultData(_result);
//                            res.json(result);
//                        });

                    var columns = "*";
                    if(requestQuery.exportCSV){
                        result.pagination.startRow = 0;
                        result.pagination.maxRowsPerQuery = totalRowCount;

                        columns = [
                            "game_id",
                            "game_title",
                            "date_created",
                            "is_premium",
                            "total_users_played",
                            "total_users_solved"
                        ];
                    }

                    knex.select(columns)
                        .from("games_list_view")
                        .whereRaw(objSearchSQL.sqlWhere, objSearchSQL.whereParams)
                        .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
                        .offset(result.pagination.startRow)
                        .limit(result.pagination.maxRowsPerQuery)
                        .then(function(_result){
                            var data = appFunction.convertQueryResultData(_result);

                            if(requestQuery.exportCSV){
                                appFunction.exportCSV(data, "game", function(filePath){
                                    res.send({
                                        csvUrl : filePath
                                    });
                                })
                            }else{
                                result.data = data;
                                res.json(result);
                            }
                        })
                }else{
                    res.json(result);
                }
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });



    /* GET GAME BY ID
     * ====================================================================== */

    router.get("/games/:gameId", function(req, res) {
        knex.select("*")
            .from("games_list_view")
            .where("game_id", req.param("gameId"))
            .then(function(_result){
                var result = appFunction.convertQueryResultData(_result);

                res.json(result);
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });



    /* UPDATE GAME
     * ====================================================================== */

    router.put("/games/:gameId", function(req, res){
        var normalFields = [
                "game_title",
                "is_premium",
                "game_data",
                "is_public",
                "reward_id"
            ],
            dateFields = [
                "date_created"
            ],
            requestBody = req.body;

        // Set back reward ID to null when user select this is not premium game
        if(requestBody.isPremium == "0"){
            requestBody.rewardId = null;
        }

        var requestParameters = appFunction.convertRequestDataToUnderscore(requestBody),
            updateNormalFields = _u.pick(requestParameters, normalFields),
            updateDateFields = _u.pick(requestParameters, dateFields);


        knex.transaction(function(trx){
                return trx("games")
                    .update(updateNormalFields)
                    .where("game_id", req.param("gameId"))
                    .then(function(){
                        return trx.raw("update games set " + appFunction.prepareUpdateDateQuery(updateDateFields, req.user.deviceType) + " where game_id = ?", req.param("gameId"));
                    })
            })
            .then(function(updatedRow) {
                console.log("==== GAMES - all fields updated.");
                console.log(updatedRow);
                var result = {
                    data       : requestBody,
                    message    : globalSettings.message.update
                };

                res.json(result);
            })
            .catch(function(err) {
                // If we get here, that means that neither the 'Old Books' catalogues insert,
                // nor any of the books inserts will have taken place.
                res.send(400, { message : err.toString() });
            });
    });



    /* ADD GAME
     * ====================================================================== */

    router.post("/games", function(req, res) {
        var requestBody = req.body;

        // Set back reward ID to null when user select this is not premium game
        if(requestBody.isPremium == "0"){
            requestBody.rewardId = null;
        }

        var requestParameters = appFunction.convertRequestDataToUnderscore(requestBody);

        knex.insert(requestParameters)
            .into("games")
            .then(function(){
                var result = {
                    data       : requestBody,
                    message    : globalSettings.message.insert
                };

                res.json(result);
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });


    
    /* GET GAME RANKING BY GAME ID
     * ====================================================================== */
    
    router.get("/games/:gameId/ranking", function(req, res){
        var requestQuery = req.query,
            gameId = req.param("gameId"),
            objSearchSQL = {},
            currentPage = requestQuery.currentPage ? parseInt(requestQuery.currentPage) : 1,
            result = {
                pagination : {},
                data : [],
                message : ""
            };

        objSearchSQL.orderBy = "high_score";
        objSearchSQL.orderDirection = "asc";

        knex.select("users_games.*")
            .select("users.nickname")
            .from("users_games")
            .join("users", "users.user_id", "=", "users_games.user_id")
            .where({
                game_id : gameId
            })
            .whereNotNull("high_score")
            .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
            .limit(3)
            .then(function(_result){
                result.data = appFunction.convertQueryResultData(_result);
                res.json(result);
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });
};