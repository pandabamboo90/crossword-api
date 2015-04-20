var crosswordServices = angular.module("crosswordServices", ["ngResource"]);

crosswordServices.factory("admins", ["$resource", "SERVER_CONFIG",
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



crosswordServices.factory("users", ["$resource", "SERVER_CONFIG",
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



crosswordServices.factory("games", ["$resource", "SERVER_CONFIG",
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



crosswordServices.factory("rewards", ["$resource", "SERVER_CONFIG",
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



crosswordServices.factory("otherContent", ["$resource", "SERVER_CONFIG",
    function ($resource, SERVER_CONFIG) {
        return $resource(SERVER_CONFIG.apiUrl() + "/:contentType", {
            contentType : "@contentType"
        }, {
            updateContent : {
                method : "PUT"
            }
        });
    }
]);



crosswordServices.factory("trackingData", [
    function(){
        return {
            rewards : {
                list : {},
                attended : {},
                won : {},
                activeTabId : "",
                empty : function(){
                    this.activeTabId = "";
                    this.list = {};
                    this.attended = {};
                    this.won = {};
                }
            }
        }
    }
]);



crosswordServices.factory("tokenInterceptor", ["$rootScope", "$q", "$window", "$location", "trackingData",
    function ($rootScope, $q, $window, $location, trackingData) {
        return {
            // On request success
            request: function (config) {
                config.headers = config.headers || {};

                // Attach the token to header for authenticate with server
                if ($window.sessionStorage.token) {
                    config.headers.Authorization = "Bearer " + $window.sessionStorage.token;
                }
                return config || $q.when(config);
            },
            requestError: function(request){

                // Throw out the error
                return $q.reject(request);
            },
            // On response success
            response: function (response) {

                return response || $q.when(response);
            },
            // On response failture
            responseError: function (response) {

                // The response contains the data about the error.
                if (response.status === 401) {
//                    $rootScope.loggedUserInfo = null;
                    $rootScope.showNav = false;

//                    delete $window.sessionStorage.loggedUserInfo;
                    delete $window.sessionStorage.token;

                    //console.log(response);
                    // Login again to renew the token
                    $location.path("/login").search({
                        errorMessage : "Your session has been expired. Please login again."
                    });
                }

                // Throw out the error
                return $q.reject(response);
            }
        };
    }
]);