crosswordApp.controller("rewardAddController", ["$scope", "rewards", "$location", "SERVER_CONFIG", "FileUploader", "$validator",
    function($scope, rewards, $location, SERVER_CONFIG, FileUploader, $validator){
        var dateFields = [
            "dateEndOfAttending",
            "dateSweepstakes"
        ];

        $scope.reward = {
            rewardTitle : "",
            rewardThumb : "",
            rewardDescription : "",
            isPremium : 0,
            quantity : 0
        };

        // Uploader for thumbnail image
        $scope.uploader = new FileUploader({
            url:  SERVER_CONFIG.hostUrl() + "/upload/reward-thumbnail",
            autoUpload : true,
            removeAfterUpload : true,
            filters : [
                {
                    name: 'isImage',
                    fn: function(item) {
                        return item.type.indexOf("image") != -1;
                    }
                }
            ],
            onWhenAddingFileFailed : function(item, filter, options){
                if(filter.name == "isImage"){
                    $scope.uploadMessage = "This is not image file. (JPG, JPEG, PNG, GIF)";
                }
            },
            onBeforeUploadItem : function(item){
                item.file.name = encodeURIComponent(item.file.name)
            },
            onSuccessItem : function(fileItem, response, status, headers) {
                $scope.uploadMessage = "";
                $scope.reward.rewardThumb = decodeURIComponent(response.rewardThumb);
            },
            onErrorItem : function(fileItem, response, status, headers){
                $scope.uploadMessage = response.message;
            }
        });

//        console.log($scope.uploader);


        // Uploader for reward info
        $scope.uploaderRewardInfo = new FileUploader({
            url:  SERVER_CONFIG.hostUrl() + "/csv/reward-info",
            autoUpload : true,
            removeAfterUpload : true,
            filters : [
                {
                    name: 'isCSV',
                    fn: function(item) {
                        //console.log(item)
                        return item.name.split(".").pop() === "csv";
                    }
                }
            ],
            onWhenAddingFileFailed : function(item, filter, options){
                $scope.rewardInfoUploadStatus = "error";
                if(filter.name == "isCSV"){
                    $scope.rewardInfoMessage = "This is not CSV file.";
                }
            },
            onBeforeUploadItem : function(item){
                item.file.name = encodeURIComponent(item.file.name)
            },
            onSuccessItem : function(fileItem, response, status, headers){
                $scope.rewardInfoUploadStatus = response.type;
                $scope.rewardInfoMessage = response.message;
                $scope.reward = response.rewardInfo;
            },
            onErrorItem : function(fileItem, response, status, headers){
                $scope.rewardInfoUploadStatus = response.type;
                $scope.rewardInfoMessage = response.message;
            }
        });



        // Insert reward
        $scope.submitForm = function(){
            $validator
                .validate($scope, "reward")
                .success(function(){
                    rewards.createReward($scope.reward)
                        .$promise
                        .then(function(data){
                            $scope.back(data.message);
                        },function(err){
                            //console.log(err)
                            $scope.errorMessage = err.data.message
                        });

                })
                .error(function(){
                    // Do something when error happen
                });
        };

        // Back button event
        $scope.back = function(message){
            $location.path("/rewards").search("successMessage", message);
        };
    }]
);