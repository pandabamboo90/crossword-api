app.factory("adminsAPIService", ["$resource", "SERVER_CONFIG",
    function ($resource, SERVER_CONFIG) {
        return $resource(SERVER_CONFIG.apiUrl() + "/admins/:adminId", {
            adminId : "@adminId"
        }, {
            login : {
                method: "POST",
                url: SERVER_CONFIG.hostUrl() + "/authenticate",
                isArray: false
            },
            changePassword : {
                method: "PUT",
                url: SERVER_CONFIG.apiUrl() + "/admins/:adminId/change-password",
                isArray: false
            }
        });
    }
]);



app.factory("users", ["$resource", "SERVER_CONFIG",
    function ($resource, SERVER_CONFIG) {
        return $resource(SERVER_CONFIG.apiUrl() + "/users/:userId", {
            userId : "@userId"
        }, {
            searchUsers : {
                method : "GET",
                url : SERVER_CONFIG.apiUrl() + "/users",
                isArray : false
            },
            updateUser : {
                method : "PUT"
            },
            createUser : {
                method : "POST"
            },
            register : {
                method : "POST",
                url : SERVER_CONFIG.hostUrl() +"/register",
                isArray: false
            },
            getRanking : {
                method : "GET",
                url : SERVER_CONFIG.apiUrl() +"/users/:userId/ranking",
                isArray: false
            },
            getAllRewardsAttended : {
                method : "GET",
                url : SERVER_CONFIG.apiUrl() +"/users/:userId/rewards",
                isArray: false
            },
            testSync : {
                method : "POST",
                url : SERVER_CONFIG.apiUrl() +"/sync/:userId",
                isArray: false
            }
        });
    }
]);



app.factory("games", ["$resource", "SERVER_CONFIG",
    function ($resource, SERVER_CONFIG) {
        return $resource(SERVER_CONFIG.apiUrl() + "/games/:gameId", {
            gameId : "@gameId"
        }, {
            searchGames : {
                method : "GET",
                url : SERVER_CONFIG.apiUrl() + "/games",
                isArray : false
            },
            createGame : {
                method : "POST"
            },
            updateGame : {
                method : "PUT"
            },
            getRanking : {
                method : "GET",
                url : SERVER_CONFIG.apiUrl() +"/games/:gameId/ranking",
                isArray: false
            }
        });
    }
]);



app.factory("rewards", ["$resource", "SERVER_CONFIG",
    function ($resource, SERVER_CONFIG) {
        return $resource(SERVER_CONFIG.apiUrl() + "/rewards/:rewardId", {
            rewardId : "@rewardId"
        }, {
            searchRewards : {
                method : "GET",
                url : SERVER_CONFIG.apiUrl() +"/rewards",
                isArray : false
            },
            updateReward : {
                method : "PUT"
            },
            createReward : {
                method : "POST"
            },
            getListUsers : {
                method : "GET",
                url : SERVER_CONFIG.apiUrl() +"/rewards/:rewardId/users/:listType",
                isArray : false
            },
            getUserDetail : {
                method : "GET",
                url : SERVER_CONFIG.apiUrl() +"/rewards/:rewardId/users/:listType/:userId",
                isArray : true
            },
            getAttendedHistory : {
                method : "GET",
                url : SERVER_CONFIG.apiUrl() +"/rewards/:rewardId/users/:listType/:userId/history",
                isArray : false
            },
            updateUserWinOrLose : {
                method: "PUT",
                url : SERVER_CONFIG.apiUrl() +"/rewards/:rewardId/users/:listType/:userId",
                isArray: false
            },
            getListUsersWon : {
                method: "GET",
                url : SERVER_CONFIG.apiUrl() +"/rewards/users/won",
                isArray: false
            }
        });
    }
]);