module.exports = function (app, router, pool, _u, appFunction, globalSettings, email, apn, gcm, fastCSV, path, fs, log){

    var knex = app.get("knex"),
        Promise = app.get("Promise");
    
    
    /* SEARCH REWARDS
     * ====================================================================== */

    router.get("/rewards", function(req, res){
        var requestQuery = req.query,
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

        // If this is using for selecting reward in game detail
        if(requestQuery.selectRewardForGame){
            if(parseInt(requestQuery.includeRewardId) > 0){
                objSearchSQL.sqlWhere += "and (reward_id not in (select distinct reward_id from games_list_view where isNull(reward_id) = false) or reward_id = ?)";
                objSearchSQL.whereParams.push(requestQuery.includeRewardId)
            }else{
                objSearchSQL.sqlWhere += "and reward_id not in (select distinct reward_id from games_list_view where isNull(reward_id) = false) ";
            }
        }

        knex.count("* as totalRowCount")
            .from("rewards")
            .whereRaw(objSearchSQL.sqlWhere, objSearchSQL.whereParams)
            .then(function(_result){
                var totalRowCount = _u.values(_result[0])[0];

                if(requestQuery.currentPage)
                    result.message = globalSettings.message.foundRecords(totalRowCount);

                if(totalRowCount > 0){
                    if(req.user.deviceType == "mobile" || requestQuery.isMobileDebug){
                        result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount, globalSettings.pagination.mobile.maxPagesPerQuery, globalSettings.pagination.mobile.rowsPerPage);

                        //var rawSQL = "select m_users_attended_list_view.* from (select @p1:=? p) parm , m_users_attended_list_view";
                        knex.select("*")
                            .from("m_users_attended_list_view")
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
                        result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount);

                        var columns = "*";
                        if(requestQuery.exportCSV){
                            result.pagination.startRow = 0;
                            result.pagination.maxRowsPerQuery = totalRowCount;
                        }

                        knex.select(columns)
                            .from("rewards_list_view")
                            .whereRaw(objSearchSQL.sqlWhere, objSearchSQL.whereParams)
                            .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
                            .offset(result.pagination.startRow)
                            .limit(result.pagination.maxRowsPerQuery)
                            .then(function(_result){
                                var data = appFunction.convertQueryResultData(_result);

                                if(requestQuery.exportCSV){
                                    appFunction.exportCSV(data, "item", function(filePath){
                                        res.send({
                                            csvUrl : filePath
                                        });
                                    })
                                }else{
                                    // Send the current datetime on server for countdown function on mobile
                                    result.currentDatetime = (new Date).getTime();
                                    result.data = data;
                                    res.json(result);
                                }
                            })
                    }

//                    var subQuery =
//                        knex.select("reward_id as tmp_reward_id")
//                            .from("rewards")
//                            .whereRaw(objSearchSQL.sqlWhere, objSearchSQL.whereParams)
//                            .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
//                            .offset(result.pagination.startRow)
//                            .limit(result.pagination.maxRowsPerQuery)
//                            .as("tmp");
//
//
//                    knex.select("*")
//                        .from("rewards_list_view")
//                        .join(subQuery, "reward_id", "=", "tmp_reward_id")
//                        .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
//                        .then(function(_result){
//                            result.data = appFunction.convertQueryResultData(_result);
//                            // Send the current datetime on server for countdown function on mobile
//                            result.currentDatetime = (new Date).getTime();
//                            res.json(result);
//                        });



                }else{
                    res.json(result);
                }
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });



    /* [MOBILE] GET LIST REWARD WITH TICKETS ATTENDED
     * ====================================================================== */

    router.get("/rewards/:userId/list", function(req, res){
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
            .from("rewards")
            .whereRaw(objSearchSQL.sqlWhere, objSearchSQL.whereParams)
            .then(function(_result){
                var totalRowCount = _u.values(_result[0])[0];

                if(requestQuery.currentPage)
                    result.message = globalSettings.message.foundRecords(totalRowCount);

                if(totalRowCount > 0){
                    result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount, globalSettings.pagination.mobile.maxPagesPerQuery, globalSettings.pagination.mobile.rowsPerPage);

                    //var rawSQL = "select m_users_attended_list_view.* from (select @p1:=? p) parm , m_users_attended_list_view";
                    knex.select("m_rlv.*")
                        .from(knex.raw("(select @p1:=? p) parm , m_rewards_list_view m_rlv", [userId]))
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



    /* GET REWARD BY ID
     * ====================================================================== */

    router.get("/rewards/:rewardId", function(req, res) {
        knex.select("*")
            .from("rewards_list_view")
            .where("reward_id", req.param("rewardId"))
            .then(function(_result){
                var result = appFunction.convertQueryResultData(_result)
                    result[0].currentDatetime = (new Date).getTime();
                res.json(result);
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });



    /* UPDATE REWARD
     * ====================================================================== */

    router.put("/rewards/:rewardId", function(req, res){
        var normalFields = [
                "reward_title",
                "reward_thumb",
                "reward_description",
                "is_premium",
                "quantity"
            ],
            dateFields = [
                "date_created",
                "date_end_of_attending",
                "date_sweepstakes"
            ],
            requestParameters = appFunction.convertRequestDataToUnderscore(req.body),
            updateNormalFields = _u.pick(requestParameters, normalFields),
            updateDateFields = _u.pick(requestParameters, dateFields);


        knex.transaction(function(trx){
                return trx("rewards")
                    .update(updateNormalFields)
                    .where("reward_id", req.param("rewardId"))
                    .then(function(){
                        return trx.raw("update rewards set " + appFunction.prepareUpdateDateQuery(updateDateFields, req.user.deviceType) + " where reward_id = ?", req.param("rewardId"));
                    })
            })
            .then(function(updatedRow) {
                console.log("==== REWARDS - all fields updated.");
                console.log(updatedRow);
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
    


    /* ADD REWARD
     * ====================================================================== */

    router.post("/rewards", function(req, res) {
        var requestParameters = appFunction.convertRequestDataToUnderscore(req.body);

        knex.insert(requestParameters)
            .into("rewards")
            .then(function(){
                var result = {
                    data       : req.body,
                    message    : globalSettings.message.insert
                };

                res.json(result);
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });



    /* [MOBILE] GET LIST ALL USERS WON REWARDS
     * ====================================================================== */

    router.get("/rewards/users/won", function (req, res) {
        var requestQuery = req.query,
            requestParameters = appFunction.convertRequestDataToUnderscore(requestQuery),
            objSearchSQL = appFunction.buildSQLSearchQuery(requestParameters),
            currentPage = requestQuery.currentPage ? parseInt(requestQuery.currentPage) : 1,
            result = {
                pagination : {},
                data : [],
                message : ""
            };
        //console.log(requestQuery.isMobileDebug)

        objSearchSQL.orderBy = requestQuery.orderBy ? appFunction.camelCaseToUnderscore(requestQuery.orderBy) : "user_id";
        objSearchSQL.orderDirection = requestQuery.orderDirection === undefined ? "desc" : (requestQuery.orderDirection ? "asc" : "desc");


        knex.count("* as totalRowCount")
            .from("rewards")
            .where({
                status : 2
            })
            .then(function(_result){
                var totalRowCount = _u.values(_result[0])[0];

                if(requestQuery.currentPage)
                    result.message = globalSettings.message.foundRecords(totalRowCount);


//                requestQuery.isMobileDebug = true;

                if(totalRowCount > 0){
                    if(req.user.deviceType == "mobile" || requestQuery.isMobileDebug){
                        result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount, globalSettings.pagination.mobile.maxPagesPerQuery, globalSettings.pagination.mobile.rowsPerPage);
                    }else{
                        result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount);
                    }

                    knex.select("reward_id")
                        .from("rewards")
                        .where({
                            status : 2
                        })
                        .orderBy("reward_id", "desc")
                        .offset(result.pagination.startRow)
                        .limit(result.pagination.maxRowsPerQuery)
                        .then(function(_result){
                            var rewardIdList = [];

                            // Filter out the reward_id from the result list
                            _u.each(_u.pluck(_result, "reward_id"), function(_rewardId, k){
                                rewardIdList[k] = parseInt(_rewardId)
                            });

                            return knex.select("*")
                                .from("users_won_list_view")
                                .whereIn("reward_id", rewardIdList)

                        }).then(function(_result){
                            var resultData = appFunction.convertQueryResultData(_result);
                            var uniqueRewardList = [];
                            var userInfoFields = [
                                "user_id",
                                "nickname",
                                "realname",
                                "address",
                                "phone",
                                "email"
                            ];


                            Promise.all(_u.each(resultData, function(v, k){
                                uniqueRewardList.push(_u.values(_u.pick(v, "rewardId")))
                            }))
                            .then(function(){
                                return Promise.all(_u.each(_u.uniq(_u.flatten(uniqueRewardList)), function(_rewardId){
                                    var resultOjb = {
                                        // List of user won this reward
                                        usersWonList : []
                                        // Append reward info here
                                        // ...
                                        //
                                    };

                                    var rewardInfo = _u.omit(_u.find(resultData, function(obj){
                                        return obj.rewardId == _rewardId;
                                    }), userInfoFields);

                                    resultOjb.usersWonList = _u.filter(resultData, function(obj){
                                       return obj.rewardId == _rewardId
                                    }).map(function(obj){
                                        return _u.pick(obj, userInfoFields);
                                    });

                                    // append reward info to resultOjb and push to data
                                    result.data.push(_u.extend(resultOjb, rewardInfo));
                                }))
                            })
                            .then(function(){
                                res.json(result);
                            });
                        })
                }else{
                    res.json(result);
                }
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });


//        knex.count("* as totalRowCount")
//            .from("users_won_list_view")
//            .then(function(_result){
//                var totalRowCount = _u.values(_result[0])[0];
//
//                if(requestQuery.currentPage)
//                    result.message = globalSettings.message.foundRecords(totalRowCount);
//
//                if(totalRowCount > 0){
//                    if(req.user.deviceType == "mobile" || requestQuery.isMobileDebug){
//                        result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount, globalSettings.pagination.mobile.maxPagesPerQuery, globalSettings.pagination.mobile.rowsPerPage);
//                    }else{
//                        result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount);
//                    }
//
//                    knex.select("*")
//                        .from("users_won_list_view")
//                        .whereRaw(objSearchSQL.sqlWhere, objSearchSQL.whereParams)
//                        .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
//                        .offset(result.pagination.startRow)
//                        .limit(result.pagination.maxRowsPerQuery)
//                        .then(function(_result){
//                            result.data = appFunction.convertQueryResultData(_result);
//                            res.json(result);
//                        })
//                }else{
//
//                    res.json(result);
//                }
//            })
//            .catch(function(err){
//                res.send(400, { message : err.toString() });
//            });
    });


    /* GET ALL USERS ATTENDED/WON A REWARD
     * ====================================================================== */

    router.get("/rewards/:rewardId/users/:listType", function (req, res) {
        var requestQuery = req.query,
            requestParameters = appFunction.convertRequestDataToUnderscore(requestQuery),
            objSearchSQL = appFunction.buildSQLSearchQuery(requestParameters),
            viewName = req.param("listType").toLowerCase() === "attended" ? "users_attended_list_view" : "users_won_list_view",
            currentPage = requestQuery.currentPage ? parseInt(requestQuery.currentPage) : 1,
            result = {
                pagination : {},
                data : [],
                message : ""
            };

        objSearchSQL.orderBy = requestQuery.orderBy ? appFunction.camelCaseToUnderscore(requestQuery.orderBy) : "user_id";
        objSearchSQL.orderDirection = requestQuery.orderDirection === undefined ? "desc" : (requestQuery.orderDirection ? "asc" : "desc");

        knex.count("* as totalRowCount")
            .from(viewName)
            //.where("reward_id", req.param("rewardId"))
            .whereRaw(objSearchSQL.sqlWhere, objSearchSQL.whereParams)
            .andWhere("reward_id", req.param("rewardId"))
            .then(function(_result){
                var totalRowCount = _u.values(_result[0])[0];

                if(totalRowCount > 0){
                    if(req.user.deviceType == "mobile" || requestQuery.isMobileDebug){
                        result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount, globalSettings.pagination.mobile.maxPagesPerQuery, globalSettings.pagination.mobile.rowsPerPage);
                    }else{
                        result.pagination = appFunction.generatePagesArray(currentPage, totalRowCount);
                    }

                    var columns = "*";
                    if(requestQuery.exportCSV){
                        result.pagination.startRow = 0;
                        result.pagination.maxRowsPerQuery = totalRowCount;
                        columns = [
                            "reward_id",
                            "reward_title",
                            "user_id",
                            "nickname",
                            "address",
                            "phone",
                            "is_reward_delivered"
                        ];
                    }

                    knex.select(columns)
                        .from(viewName)
                        //.where("reward_id", req.param("rewardId"))
                        .whereRaw(objSearchSQL.sqlWhere, objSearchSQL.whereParams)
                        .andWhere("reward_id", req.param("rewardId"))
                        .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
                        .offset(result.pagination.startRow)
                        .limit(result.pagination.maxRowsPerQuery)
                        .then(function(_result){
                            var data = appFunction.convertQueryResultData(_result);

                            if(requestQuery.exportCSV){
                                appFunction.exportCSV(data, "winner", function(filePath){
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
                    result.message = globalSettings.message.foundRecords(totalRowCount)
                    res.json(result);
                }
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });



    /* GET USER ATTENDED/WON DETAIL
     * ====================================================================== */

    router.get("/rewards/:rewardId/users/:listType/:userId", function (req, res) {
        var viewName = req.param("listType").toLowerCase() === "attended" ? "users_attended_list_view" : "users_won_list_view";

        knex.select("*")
            .from(viewName)
            .where({
                reward_id : req.param("rewardId"),
                user_id : req.param("userId")
            })
            .then(function(_result){
                var result = appFunction.convertQueryResultData(_result);
                res.json(result);
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });



    /* UPDATE USER WIN OR LOSE
     * ====================================================================== */

    router.put("/rewards/:rewardId/users/:listType/:userId", function (req, res) {
        var normalFields = [
            "nickname",
            "email",
            "realname",
            "address",
            "phone",
            "facebook",
            "twitter",
            "google",
            "win_or_lose",
            "is_reward_delivered"
        ], dateFields = [
            "date_created",
            "date_last_accessed",
            "date_review_confirm_appear",
            "date_submit_review"
        ],
            listType = req.param("listType"),
            requestBody = req.body,
            requestParameters = appFunction.convertRequestDataToUnderscore(requestBody),
            updateNormalFields = _u.pick(requestParameters, normalFields),
            updateDateFields = _u.pick(requestParameters, dateFields),
            result = {
                data : "",
                message : "",
                mailMessage : "",
                apnMessage : "",
                gcmMessage : ""
            };

        // TODO : Check current date is after the sweepstakes date ? -- If OK, do the update, else give error
        // -- Info : Explicit using Date("now") in .isAfter function
        if(Date.parse(requestParameters["date_sweepstakes"]).isAfter() && requestBody.alreadyWonReward == 0 && requestParameters["win_or_lose"] == 1){
            res.send(400, { message : globalSettings.errorMessage.sweepstakesDateIncorrect })
        }else{
            knex.transaction(function(trx){
                return trx("users")
                    .join("users_rewards", "users.user_id", "=", "users_rewards.user_id")
                    .update(updateNormalFields)
                    .where({
                        "users.user_id" : req.param("userId"),
                        reward_id: req.param("rewardId")
                    })
                    .then(function(){
                        return trx.raw("update users set " + appFunction.prepareUpdateDateQuery(updateDateFields, req.user.deviceType) + " where user_id = ?", req.param("userId"));
                    })
                    .then(function(){
                        console.log("==== WIN OR LOSE - all fields updated.");
                        result.message = globalSettings.message.update;

                        /* SET USER TO WIN THIS REWARD, (1st TIME), UPDATE REWARD STATUS TO 2
                         * Update reward status = 2 to notify for client this reward has been in time for sweepstakes, cannot register to this reward anymore.
                         * ====================================================================== */
                        if(requestBody.alreadyWonReward == 0 && listType == "attended" && requestParameters["win_or_lose"] == 1){
                            trx("rewards")
                                .update("status", 2)
                                .where({
                                    reward_id: req.param("rewardId")
                                })
                                .then(function() {
                                    console.log("==== REWARD STATUS UPDATED");

                                    // TODO : Send mail after update user win a reward
                                    var mailServer = Promise.promisifyAll(email.server.connect(globalSettings.mailServer));

                                    // send the message and get a callback with an error or details of the message that was sent
                                    mailServer.sendAsync({
                                        text       : globalSettings.mailText,
                                        from       : requestBody.realname + "<" + requestBody.email + ">",
                                        to         : requestBody.realname + "<" + requestBody.email + ">",
                                        cc         : "",
                                        subject    : globalSettings.mailSubject,
                                        attachment : [
                                            { data : globalSettings.mailTemplate, alternative : true }
                                        ]
                                    })
                                        .then(function(){
                                            result.mailMessage = globalSettings.message.sendMail;
                                            console.log("==== SEND MAIL SUCCESS")
                                        })
                                        .catch(function(err){
                                            // mail error catched here
                                            console.log("SEND MAIL ERROR : ", err.message);
                                            result.mailMessage = globalSettings.errorMessage.sendMail;
                                        })
                                        .then(function(){
                                            // TODO : Send push notification for mobile users
                                            if(requestBody.deviceOs == "ios" && requestBody.notifyFlag == 1){
                                                /* APN ( APPLE PUSH NOTIFICATION ) [PUSH]
                                                 * ====================================================================== */

                                                // Create a new agent
                                                var apnagent = require("apnagent"),
                                                    agent = new apnagent.Agent(),
                                                // Locate your certificate [PRODUCTION]
                                                    pfx = globalSettings.apn.certProduction;

                                                if(globalSettings.apn.isDevelopment){
                                                    agent.enable("sandbox");
                                                    // our credentials were for development
                                                    pfx = globalSettings.apn.cert;
                                                }

                                                // set our credentials
                                                agent.set("pfx file", pfx);
                                                agent.set("passphrase", globalSettings.apn.passphrase );

                                                agent.on("message:error", function (err, msg) {
                                                    log.error(err);
                                                    result.apnMessage = globalSettings.errorMessage.apn;

                                                    switch (err.name) {
                                                        // This error occurs when Apple reports an issue parsing the message.
                                                        case "GatewayNotificationError":
                                                            console.log("[message:error] GatewayNotificationError: %s", err.message);

                                                            // The err.code is the number that Apple reports.
                                                            // Example: 8 means the token supplied is invalid or not subscribed
                                                            // to notifications for your application.
                                                            if (err.code === 8) {
                                                                console.log("    > %s", msg.device().toString());
                                                                // In production you should flag this token as invalid and not
                                                                // send any futher messages to it until you confirm validity
                                                            }

                                                            break;

                                                        // This happens when apnagent has a problem encoding the message for transfer
                                                        case "SerializationError":
                                                            console.log("[message:error] SerializationError: %s", err.message);
                                                            break;

                                                        // unlikely, but could occur if trying to send over a dead socket
                                                        default:
                                                            console.log("[message:error] other error: %s", err.message);
                                                            break;
                                                    }
                                                });

                                                //var myDevice = "86577ffd0c7286f0412dff99f034b963f3684145c9b3bc07718c97618cf8ae24";
                                                agent.createMessage()
                                                    .device(requestBody.deviceToken)
                                                    .alert(globalSettings.message.rewardWinner)
                                                    .set("rewardId", req.param("rewardId"))
                                                    .send();

                                                agent.connect(function (err) {
                                                    // gracefully handle auth problems
                                                    if (err && err.name === "GatewayAuthorizationError") {
                                                        console.log("Authentication Error: %s", err.message);
                                                        log.error("Authentication Error: %s", err.message);
                                                        process.exit(1);
                                                    }

                                                    // handle any other err (not likely)
                                                    else if (err) {
                                                        log.error("APN : Other error", err);
                                                        throw err;
                                                    }

                                                    // it worked!
                                                    var env = agent.enabled("sandbox") ? "sandbox" : "production";
                                                    console.log("apnagent [%s] gateway connected", env);
                                                    console.log("==== APN PUSH NOTIFICATION SUCCESS")
                                                    result.apnMessage = globalSettings.message.apn;
                                                    res.json(result);
                                                });


                                                /* APN ( APPLE PUSH NOTIFICATION ) [FEEDBACK]
                                                 * ====================================================================== */

                                                var feedback = new apnagent.MockFeedback();

                                                feedback.set("interval", "30s") // default is 30 minutes?
                                                    .connect();
                                            }else if(requestBody.deviceOs == "android" && requestBody.notifyFlag == 1){
                                                // Create a message object
                                                var message = new gcm.Message({
                                                    collapseKey: "crossword",
                                                    delayWhileIdle: true,
                                                    timeToLive: 3,
                                                    dryRun : false, // Set to false to treat this message as the REAL message (Not test)
                                                    data: {
                                                        message : globalSettings.message.rewardWinner,
                                                        rewardId : requestBody.rewardId
                                                    }
                                                });

                                                // Set Google API Token here
                                                var sender = new gcm.Sender(globalSettings.gcm.apiToken);
                                                var registrationIds = []; // Device token list
                                                registrationIds.push(requestBody.deviceToken);

                                                /**
                                                 * Params: message-literal, registrationIds-array, No. of retries, callback-function
                                                 **/
                                                sender.send(message, registrationIds, 1, function (err, successObj) {
                                                    if(err) log.error(err);
                                                    console.log("==== GCM PUSH NOTIFICATION SUCCESS")
                                                    result.gcmMessage = globalSettings.message.gcm;
                                                    res.json(result);
                                                });
                                            }else{
                                                console.log("==== USER " , req.param("userId") , " TURN OFF THE PUSH NOTIFICATION SETTING");
                                                res.json(result);
                                            }
                                        })
                                })
                        }
                        else{
                            res.json(result)
                        }
                    })
            })
            .catch(function(err) {
                // If we get here, that means that neither the 'Old Books' catalogues insert,
                // nor any of the books inserts will have taken place.
                res.send(400, { message : err.toString() });
            });
        }
    });


    /* GET USER ATTENDED/WON HISTORY 
     * ====================================================================== */

    router.get("/rewards/:rewardId/users/:listType/:userId/history", function (req, res) {
        var requestQuery = req.query,
            objSearchSQL = {},
            viewName = req.param("listType").toLowerCase() === "attended" ? "users_attended_list_view" : "users_won_list_view",
            currentPage = requestQuery.currentPage ? parseInt(requestQuery.currentPage) : 1,
            result = {
                pagination : {},
                data : [],
                message : ""
            };

        objSearchSQL.orderBy = requestQuery.orderBy ? appFunction.camelCaseToUnderscore(requestQuery.orderBy) : "reward_id";
        objSearchSQL.orderDirection = requestQuery.orderDirection === undefined ? "desc" : (requestQuery.orderDirection ? "asc" : "desc");


        knex.count("* as totalRowCount")
            .from(viewName)
            .where("user_id", req.param("userId"))
            .whereNotIn("reward_id", req.param("rewardId"))
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

                    knex.select("*")
                        .from(viewName)
                        .where("user_id", req.param("userId"))
                        .whereNotIn("reward_id", req.param("rewardId"))
                        .orderBy(objSearchSQL.orderBy, objSearchSQL.orderDirection)
                        .then(function(_result){
                            result.data = appFunction.convertQueryResultData(_result);
                            res.json(result);
                        });
                }else{
                    res.json(result);
                }
            })
            .catch(function(err){
                res.send(400, { message : err.toString() });
            });
    });


    /* [ MOBILE ] USER REGISTER ATTENDED IN A REWARD
     * ====================================================================== */

    router.post("/rewards/:rewardId/user-attend/:userId", function (req, res) {

        var requestParameters = appFunction.convertRequestDataToUnderscore(req.body);

        knex.select("*")
            .from("users_rewards")
            .where({
                user_id : req.param("userId"),
                reward_id : req.param("rewardId")
            })
            .then(function(_result){
                // User already attended in this reward -- UPDATE quantity
                if(_result.length > 0){
                    console.log("User already attended in this reward -- UPDATE quantity");
                    return knex("users_rewards")
                        .update(requestParameters)
                        .where({
                            user_id : req.param("userId"),
                            reward_id : req.param("rewardId")
                        });
                }
                // User not yet attended in this reward -- INSERT new data
                else{
                    console.log("User not yet attended in this reward -- INSERT new data");
                    return knex("users_rewards")
                        .insert(requestParameters);
                }
            })
            .then(function(){
                var result = {
                    message : globalSettings.message.registerReward
                };
                res.json(result);
            })
            .catch(function(err){
                console.log(err);
                res.send(400, { message : err.toString() });
            });
    });
};