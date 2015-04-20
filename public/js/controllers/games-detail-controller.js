crosswordApp.controller("gameDetailController", ["$scope", "$routeParams", "games", "$location", "cwGeneratorAPI", "FileUploader", "$validator", "rewards",
    function($scope, $routeParams, games, $location, cwGeneratorAPI, FileUploader, $validator, rewards){
        var dateFields = [
            "dateCreated"
        ];

        games.query({
            gameId : $routeParams.gameId
        }, function(data){
            $scope.game = data[0];
            $scope.alreadyPublic = $scope.game.isPublic;

            if ($scope.game.gameData){
                // Parse the gameData string to JSON object
                var gameObject = angular.fromJson($scope.game.gameData);


                cwGeneratorAPI.setQuestionsAndAnswers(gameObject.questions, gameObject.answers);
                cwGeneratorAPI.drawCrossword(gameObject.grid);

                if($scope.alreadyPublic == 1){
                    cwGeneratorAPI.setCwEditable(false);
                }else{
                    cwGeneratorAPI.setCwEditable(true);
                }
            }

            // Change Date format to display on inputs
            _.changeDateFormat(dateFields, $scope.game);


            // Get the reward list for premium game
            $scope.rewardListParameter = {
                isPremium : 1,
                selectRewardForGame : true,
                includeRewardId : $scope.game.rewardId
            };

            // Do the request
            rewards.searchRewards($scope.rewardListParameter)
                .$promise
                .then(function(data){
                    $scope.rewardList = data.data;
                    //$scope.successMessage = data.message;
                },function(err){
                    //console.log(err);
                    $scope.errorMessage = err.data.message;
                }
            );
        },function(err){
            //console.log(err);
            $scope.errorMessage = err.data.message;
        });

        $scope.setRewardForGame = function(_rewardId){
            if($scope.alreadyPublic < 1)
                $scope.game.rewardId = _rewardId;
        };

        $scope.submitForm = function(){
            $validator
                .validate($scope, "game")
                .success(function(){
                    $scope.form.submitted = true;
                    $scope.isCrosswordChanged = cwGeneratorAPI.isCrosswordChanged();

                    if($scope.isCrosswordChanged) return

                    // Get gameData from generator
                    var gameObject = cwGeneratorAPI.getGameObject();

                    if(gameObject.questions.length > 1 && gameObject.answers.length > 1){
                        $scope.cwValid = true;
                        //cwGeneratorAPI.generateCrossword(gameObject.questions, gameObject.answers);

                        $scope.game.gameData = angular.toJson(gameObject);

                        $scope.game.$updateGame(function(data){
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