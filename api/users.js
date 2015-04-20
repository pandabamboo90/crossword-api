module.exports = function(app, router, _u, appFunction, globalSettings, log){
    var knex = app.get("knex"),
        Promise = app.get("Promise");


    /* SEARCH USERS
     * ====================================================================== */

    router.route("/users")
        .get(function(req, res){
        var requestQuery = req.query,
            requestParameters = appFunction.convertRequestDataToUnderscore(requestQuery),
            objSearchSQL = appFunction.buildSQLSearchQuery(requestParameters),
            currentPage = requestQuery.currentPage ? parseInt(requestQuery.currentPage) : 1,
            result = {
                pagination : {},
                data : [],
                message : ""
            };

        objSearchSQL.orderBy = requestQuery.orderBy ? appFunction.camelCaseToUnderscore(requestQuery.orderBy) : "user_id";
        objSearchSQL.orderDirection = requestQuery.orderDirection === undefined ? "desc" : (requestQuery.orderDirection ? "asc" : "desc");

        knex.count("* as totalRowCount")
            .from("users")
            .whereRaw(objSearchSQL.sqlWhere, objSearchSQL.whereParams)
            .then(function(_result){
                var totalRowCount = _u.values(_result[0])[0];

                if(requestQuery.currentPage)
                    result.message = globalSettings.message.foundRecords(totalRowCount);

                if(totalRowCount > 0){
                    if(req.user.deviceType == "mobile" || requestQuery.isMobileDebug){
                        result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount, globalSettings.pagination.mobile.maxPagesPerQuery, globalSettings.pagination.mobile.rowsPerPage);
                    }else{
                        result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount);
                    }

//                    var subQuery =
//                        knex.select("user_id as tmp_user_id")
//                            .from("users")
//                            .whereRaw(objSearchSQL.sqlWhere, objSearchSQL.whereParams)
//                            .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
//                            .offset(result.pagination.startRow)
//                            .limit(result.pagination.maxRowsPerQuery)
//                            .as("tmp");
//
//                    console.log(objSearchSQL.orderDirection)
//
//                    knex.select("*")
//                        .from("users_list_view")
//                        .join(subQuery, "user_id", "=", "tmp_user_id")
//                        .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
//                        .then(function(_result){
//                            result.data = appFunction.convertQueryResultData(_result);
//                            res.json(result);
//                        })

                    var columns = "*";
                    if(requestQuery.exportCSV){
                        result.pagination.startRow = 0;
                        result.pagination.maxRowsPerQuery = totalRowCount;

                        columns = [
                            "user_id",
                            "nickname",
                            "email",
                            "date_created",
                            "realname",
                            "address",
                            "phone",
                            "notify_flag",
                            "facebook",
                            "twitter",
                            "google",
                            "date_submit_review",
                            "intro_user_nickname",
                            "coins_quantity",
                            "total_coins_used",
                            "total_games_solved",
                            "tickets_quantity",
                            "total_tickets_used",
                            "tickets_quantity_premium",
                            "total_tickets_premium_used",
                            "total_rewards_won"
                        ];
                    }


                    knex.select(columns)
                        .from("users_list_view")
                        .whereRaw(objSearchSQL.sqlWhere, objSearchSQL.whereParams)
                        .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
                        .offset(result.pagination.startRow)
                        .limit(result.pagination.maxRowsPerQuery)
                        .then(function(_result){
                            var data = appFunction.convertQueryResultData(_result);

                            if(requestQuery.exportCSV){
                                appFunction.exportCSV(data, "user", function(filePath){
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



    /* GET/UPDATE 1 USER BY ID
     * ====================================================================== */

    router.route("/users/:userId")
        .get(function(req, res) {
        knex.select("*")
            .from("users_list_view")
            .where("user_id", req.param("userId"))
            .then(function(_result){
                var result = appFunction.convertQueryResultData(_result);

                res.json(result);
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    })
        .put(function(req, res){

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
            requestParameters = appFunction.convertRequestDataToUnderscore(req.body),
            updateNormalFields = _u.pick(requestParameters, normalFields),
            updateDateFields = _u.pick(requestParameters, dateFields);


        knex.transaction(function(trx){
            return trx("users")
                .update(updateNormalFields)
                .where("user_id", req.param("userId"))
                .then(function(){
                    return trx.raw("update users set " + appFunction.prepareUpdateDateQuery(updateDateFields, req.user.deviceType) + " where user_id = ?", req.param("userId"));
                })
        })
        .then(function(_row) {
            console.log("==== USERS - all fields updated.");

            var result = {
                data       : req.body,
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



    /* GET USERS RANKING
     * ====================================================================== */

    router.route("/users/:userId/ranking")
        .get(function(req, res){
        var requestQuery = req.query,
            userId = req.param("userId"),
            objSearchSQL = {},
            currentPage = requestQuery.currentPage ? parseInt(requestQuery.currentPage) : 1,
            result = {
                pagination : {},
                data : [],
                message : ""
            };

        objSearchSQL.orderBy = "high_score";
        objSearchSQL.orderDirection = "desc";

        knex.count("* as totalRowCount")
            .from("users_games")
            .where({
                user_id : userId
            })
            .whereNotNull("high_score")
            .then(function(_result){
                var totalRowCount = _u.values(_result[0])[0];

                if(requestQuery.currentPage)
                    result.message = globalSettings.message.foundRecords(totalRowCount);

                if(totalRowCount > 0){
                    if(req.user.deviceType == "mobile" || requestQuery.isMobileDebug){
                        result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount, globalSettings.pagination.mobile.maxPagesPerQuery, globalSettings.pagination.mobile.rowsPerPage);
                    }else{
                        result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount);
                    }

                    knex.select("users_games.*")
                        .select("users.nickname")
                        .from("users_games")
                        .join("users", "users.user_id", "=", "users_games.user_id")
                        .where({
                            "users_games.user_id" : userId
                        })
                        .whereNotNull("high_score")
                        .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
                        .offset(result.pagination.startRow)
                        .limit(result.pagination.maxRowsPerQuery)
                        .then(function(_result){
                            result.data = appFunction.convertQueryResultData(_result);
                            res.json(result);
                        })
                }else{
                    res.json(result);
                }
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });



    /* [ MOBILE ] GET ALL REWARDS ATTENDED BY A USER
     * ====================================================================== */

    router.route("/users/:userId/rewards")
        .get(function (req, res) {
        var requestQuery = req.query,
            userId = req.param("userId"),
            requestParameters = appFunction.convertRequestDataToUnderscore(requestQuery),
            objSearchSQL = appFunction.buildSQLSearchQuery(requestParameters),
            currentPage = requestQuery.currentPage ? parseInt(requestQuery.currentPage) : 1,
            result = {
                pagination : {},
                data : [],
                message : ""
            };

        objSearchSQL.orderBy = requestQuery.orderBy ? appFunction.camelCaseToUnderscore(requestQuery.orderBy) : "reward_id";
        objSearchSQL.orderDirection = requestQuery.orderDirection === undefined ? "desc" : (requestQuery.orderDirection ? "asc" : "desc");

        knex.count("* as totalRowCount")
            .from("m_users_attended_list_view")
            .where("user_id", userId)
            .whereRaw(objSearchSQL.sqlWhere, objSearchSQL.whereParams)
            .then(function(_result){
                var totalRowCount = _u.values(_result[0])[0];

                if(requestQuery.currentPage)
                    result.message = globalSettings.message.foundRecords(totalRowCount);

                if(totalRowCount > 0){
                    result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount, globalSettings.pagination.mobile.maxPagesPerQuery, globalSettings.pagination.mobile.rowsPerPage);

                    knex.select("*")
                        .from("m_users_attended_list_view")
                        .where("user_id", userId)
                        .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
                        .offset(result.pagination.startRow)
                        .limit(result.pagination.maxRowsPerQuery)
                        .then(function(_result){
                            var data = appFunction.convertQueryResultData(_result);
                            // Send the current datetime on server for countdown function on mobile
                            result.currentDatetime = (new Date).getTime();
                            result.data = data;
                            res.json(result);
                        })
                }else{
                    res.json(result);
                }
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });
 };