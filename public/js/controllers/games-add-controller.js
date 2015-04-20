crosswordApp.controller("gameAddController", ["$scope", "$routeParams", "games", "$location", "cwGeneratorAPI", "FileUploader", "$validator", "rewards",
    function($scope, $routeParams, games, $location, cwGeneratorAPI, FileUploader, $validator, rewards){
        $scope.game = {
            gameTitle : "",
            isPremium : 0,
            isPublic : 0,
            gameData : {},
            rewardId : 0
        };

        $scope.alreadyPublic = $scope.game.isPublic;

        // Get the reward list for premium game
        $scope.rewardListParameter = {
            isPremium : 1,
            selectRewardForGame : true
            //includeRewardId : $scope.game.rewardId
        };

        // Do the request
        rewards.searchRewards($scope.rewardListParameter)
            .$promise
            .then(function(data){
                $scope.rewardList = data.data;
            },function(err){
                $scope.errorMessage = err.data.message;
            }
        );

        $scope.setRewardForGame = function(_rewardId){
            if($scope.alreadyPublic < 1)
                $scope.game.rewardId = _rewardId;
        };

        cwGeneratorAPI.setCwEditable(true);
        //$scope.cwValid = true

        $scope.submitForm = function(){
            $validator
                .validate($scope, "game")
                .success(function(){
                    $scope.form.submitted = true;

                    // Get gameData from generator
                    var gameObject = cwGeneratorAPI.getGameObject();

                    if(gameObject.questions.length > 1 && gameObject.answers.length > 1){
                        $scope.cwValid = true;
                        //cwGeneratorAPI.generateCrossword(gameObject.questions, gameObject.answers);

                        $scope.game.gameData = angular.toJson(gameObject);

                        games.createGame($scope.game)
                            .$promise
                            .then(function(data){
                                $scope.back(data.message);
                            },function(err){
                                //console.log(err)
                                $scope.errorMessage = err.data.message
                            });
                    }else{
                        $scope.cwValid = false
                    }
                })
                .error(function(){
                    // Do something when error happen
                });
        };

        // Back button event
        $scope.back = function(message){
            $location.path("/games").search("successMessage", message);
        };
    }]
);