app.controller("userAddController", ["$scope", "$routeParams", "users", "$location", "SERVER_CONFIG", "$rootScope", "games", "rewards",
    function($scope, $routeParams, users, $location, SERVER_CONFIG, $rootScope, games, rewards){
//        var dateFields = [
//            "dateCreated",
//            "dateReviewConfirmAppear",
//            "dateSubmitReview",
//            "dateLastAccessed",
//            "dateGetDailyCoins",
//            "dateLastUsedCoins"
//        ];
//
//
        $scope.register = function(){

            var dataOption = {
                "nickname":"dangnguyen",
                "introUserId":"3",
                "deviceToken":"<fb5024d3 a0325233 28298559 a11688c0 e6193c16 eae6cc63 9aa3cc82 0c81c36d>",
                "language":"en",
                "introUserCoinGet":"15",
                "coinsQuantity":"10",
                "ticketsQuantity":"0",
                "ticketsQuantityPremium":"0",
                "dateReviewConfirmAppear":"2014/09/29 14:25:31"
            };


            users.register(dataOption, function(data){
                console.log(data);
            });
        };
//
//        $scope.back = function(){
//            $location.path("/users").search();
//        };

        var testObj = {
            "userId":158,
            "maxGameId":39,
            "usersGames":[{"userId":158,"gameId":"40","quantityCoinsUsed":0,"dateLastCoinsUsed":null,"timesPlayed":5,"timesSolved":5},{"userId":158,"gameId":"42","quantityCoinsUsed":0,"dateLastCoinsUsed":null,"timesPlayed":10,"timesSolved":10},{"userId":158,"gameId":"43","quantityCoinsUsed":0,"dateLastCoinsUsed":null,"timesPlayed":2,"timesSolved":5},{"userId":158,"gameId":"44","quantityCoinsUsed":0,"dateLastCoinsUsed":null,"timesPlayed":2,"timesSolved":2}],
//            "usersGames" : [],
            "user":{nickname:"dangnguyen12345131231236"}
        };

        $scope.testSync = function(){
            users.testSync(testObj).$promise.then(
                function(data){
                    console.log(data)
                }, function(err){
                    console.log(err)
                }
            );
        }


        //$scope.testRanking = function(){
//            games.getRanking({
//                    gameId : 40
//            }).$promise.then(
//                function(data){
//                    console.log(data)
//                }, function(err){
//                    console.log(err)
//                }
//            );

//        games.searchGames({
//            isMobileDebug : true
//        }).$promise.then(
//            function(data){
//                console.log(data)
//            }, function(err){
//                console.log(err)
//            }
//        );
//
//
//        users.getAllRewardsAttended({
//            userId : 157
//        }).$promise.then(
//            function(data){
//                console.log(data)
//            }, function(err){
//                console.log(err)
//            }
//        );

        rewards.getListUsersWon().$promise.then(
            function(data){
                console.log(data)
            }, function(err){
                console.log(err)
            }
        );
    }]
);