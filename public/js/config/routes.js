app.config(["$routeProvider", "$locationProvider", "$httpProvider",
    function($routeProvider, $locationProvider, $httpProvider){
        // use the HTML5 History API
        $locationProvider.html5Mode(true);

        $routeProvider
            .when("/login", {
                templateUrl : "js/views/login.html",
                controller : "authController",
                access: { requiredLogin: false }
            })
            .when("/change-password", {
                templateUrl : "js/views/change-password.html",
                controller : "changePasswordController",
                access: { requiredLogin: true }
            })
            .when("/users", {
                templateUrl : "js/views/users/list-all-users.html",
                controller : "usersListController",
                access: { requiredLogin: true }
            })
            .when("/users/add", {
                templateUrl : "js/views/users/add-user.html",
                controller : "userAddController",
                access: { requiredLogin: true }
            })
            .when("/users/edit/:userId", {
                templateUrl : "js/views/users/detail-user.html",
                controller : "userDetailController",
                access: { requiredLogin: true }
            })
            .when("/games", {
                templateUrl : "js/views/games/list-all-games.html",
                controller : "gamesListController",
                access: { requiredLogin: true }
            })
            .when("/games/add", {
                templateUrl : "js/views/games/add-game.html",
                controller : "gameAddController",
                access: { requiredLogin: true }
            })
            .when("/games/edit/:gameId", {
                templateUrl : "js/views/games/detail-game.html",
                controller : "gameDetailController",
                access: { requiredLogin: true }
            })
            .when("/rewards", {
                templateUrl : "js/views/rewards/list-all-rewards.html",
                controller : "rewardsListController",
                access: { requiredLogin: true }
            })
            .when("/rewards/add", {
                templateUrl : "js/views/rewards/add-reward.html",
                controller : "rewardAddController",
                access: { requiredLogin: true }
            })
            .when("/rewards/edit/:rewardId", {
                templateUrl : "js/views/rewards/detail-reward.html",
                controller : "rewardDetailController",
                access: { requiredLogin: true }
            })
            .when("/rewards/edit/:rewardId/users/:listType/edit/:userId", {
                templateUrl : function(routeParams){
                    return "js/views/rewards/detail-user-" + routeParams.listType + ".html";
                },
                access: { requiredLogin: true }
            })
            .when("/:contentType", {
                templateUrl : function(routeParams){
                    return "js/views/other-content/" + routeParams.contentType + ".html";
                },
                controller : "otherContentController",
                access: { requiredLogin: true }
            })
            .otherwise({
                redirectTo : "/login"
            });



        //            $httpProvider.defaults.useXDomain = true;
        //            delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $httpProvider.interceptors.push("tokenInterceptor");
    }
]);