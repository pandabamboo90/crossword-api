app.controller("rewardDetailController", ["$scope", "$routeParams", "rewards", "$location", "trackingData", "SERVER_CONFIG", "FileUploader", "$validator",
    function($scope, $routeParams, rewards, $location, trackingData, SERVER_CONFIG, FileUploader, $validator){
        // Set the active tab for tabs pane
        if(_.isEmpty(trackingData.rewards.activeTabId)){
            $scope.activeTabId = $(".tab-pane:first-child").attr("id");
        }else{
            $scope.activeTabId = trackingData.rewards.activeTabId;
        }


        /*
         * REWARD DETAIL
         * ============================================================================= */

        var rewardId = $routeParams.rewardId,
            dateFields = [
                "dateCreated",
                "dateEndOfAttending",
                "dateSweepstakes"
            ];

        // Get the reward detail info
        rewards.query({
            rewardId : rewardId
        }, function(data){
            $scope.reward = data[0];

            // Change Date format to display on inputs
            _.changeDateFormat(dateFields, $scope.reward);
        },function(err){
            //console.log(err);
            $scope.errorMessage = err.data.message;
        });


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
            onSuccessItem : function(fileItem, response, status, headers) {
                $scope.uploadMessage = "";
                $scope.reward.rewardThumb = response.rewardThumb;
            },
            onErrorItem : function(fileItem, response, status, headers){
                $scope.uploadMessage = response.message;
            }
        });


        // Uploader for reward info
        $scope.uploaderRewardInfo = new FileUploader({
            url:  SERVER_CONFIG.hostUrl() + "/csv/reward-info",
            autoUpload : true,
            removeAfterUpload : true,
            filters : [
                {
                    name: 'isCSV',
                    fn: function(item) {
                        return item.type === "text/csv";
                    }
                }
            ],
            onWhenAddingFileFailed : function(item, filter, options){
                $scope.rewardInfoUploadStatus = "error";
                if(filter.name == "isCSV"){
                    $scope.rewardInfoMessage = "This is not CSV file.";
                }
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


        // Update reward info
        $scope.submitForm = function(){
            // Run the validate before submit form
            $validator
                .validate($scope, "reward")
                .success(function(){
                    $scope.reward.$updateReward(
                        function(data){
                            $scope.back(data.message);
                        },function(err){
                            //console.log(err);
                            $scope.errorMessage = err.data.message;
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


        /*
         * LIST USERS ATTENDED IN SWEEPSTAKES REWARDS
         * ============================================================================= */

        $scope.usersAttendedParameters = {
            listType : "attended",
            rewardId : rewardId,
            currentPage: 1,
            orderBy : "",
            orderDirection : false
        };



        // Prepare the list settings
        var usersAttendedDataTable = {
            data : [],
            dateFilter : "MM-dd-yyyy",
            columns : [
                {
                    title : "User ID",
                    data : "userId",
                    isSortable : true
                },
                {
                    title : "Nickname",
                    data : "nickname",
                    isSortable : true
                },
                {
                    title : "Tickets Used",
                    data : "totalTicketsUsed",
                    isSortable : true
                },
                {
                    title : "Last Attended Date ",
                    data : "dateLastTicketsUsed",
                    isSortable : true,
                    isDate : true
                },
                {
                    title : "Quantity Of Rewards Won",
                    data : "totalRewardsWon",
                    isSortable : true
                }
            ],
            clickOnRows : function(rowData){
                $scope.getUserDetail(rowData.userId, "attended");
            },
            clickOnPagingItem : function(){
                var _t = this;
                // Get current active page when click on any paging items
                $scope.usersAttendedParameters.currentPage = _t.getCurrentPage();
            },
            clickOnPrevArrow : function(){
                var _t = this;

                if(_t.getCurrentPage() < _t.getMinPageNumber()){
                    _t.loadMorePrev();
                }
            },
            clickOnNextArrow : function(){
                var _t = this;

                if(_t.getCurrentPage() > _t.getMaxPageNumber()){
                    _t.loadMoreNext();
                }
            },
            clickOnLoadMorePrev : function(){
                var _t = this;

                // Remove empty params from search query
                $scope.usersAttendedParameters = _.compactObject($scope.usersAttendedParameters);
                rewards.getListUsers($scope.usersAttendedParameters)
                    .$promise
                    .then(function(data){
                        _t.refreshData(data);
                    },function(err){
                        //console.log(err);
                        $scope.errorMessage = err.data.message;
                    });
            },
            clickOnLoadMoreNext : function(){
                var _t = this;

                // Remove empty params from search query
                $scope.usersAttendedParameters = _.compactObject($scope.usersAttendedParameters);
                rewards.getListUsers($scope.usersAttendedParameters)
                    .$promise
                    .then(function(data){
                        _t.refreshData(data);
                    },function(err){
                        //console.log(err);
                        $scope.errorMessage = err.data.message;
                    });
            },
            clickOnHeader : function(){
                var _t = this;

                $scope.usersAttendedParameters.orderDirection = _t.orderDirection;
                $scope.usersAttendedParameters.orderBy = _t.orderBy;

                // Remove empty params from search query
                $scope.usersAttendedParameters = _.compactObject($scope.usersAttendedParameters);
                $scope.usersAttendedParameters.currentPage = 1;

                rewards.getListUsers($scope.usersAttendedParameters)
                    .$promise
                    .then(function(data){
                        $scope.usersAttendedDataTable.settings = {
                            data : data.data,
                            pagination : data.pagination,
                            currentPage: 1,
                            indexPageArray: 0
                        };
                        //_t.refreshData(data);
                    },function(err){
                        //console.log(err);
                        $scope.errorMessage = err.data.message;
                    });
            },
            showCSVExportButton : false
        };

        // Get user detail base on reward ID + listype ( attended/won ) + user ID
        $scope.getUserDetail = function(_userId, listType){
            // Save search parameters before change view for showing result when go back to this view later
            if(listType == "attended"){
                trackingData.rewards.attended.parameters = $scope.usersAttendedParameters;
            }else if(listType == "won"){
                trackingData.rewards.won.parameters = $scope.usersWonParameters;
            }

            trackingData.rewards.activeTabId = $(".tab-pane.active").attr("id");

            // Change view
            $location.path("/rewards/edit/" + rewardId + "/users/" + listType + "/edit/" + _userId);
        };

        // Load before view state !
        if(!_.isEmpty(trackingData.rewards.attended.parameters)){
            $scope.usersAttendedDataTable = usersAttendedDataTable;

            // Extened the search parameters with saved parameters from saved parameters
            _.extend($scope.usersAttendedParameters, _.pick(trackingData.rewards.attended.parameters, _.keys($scope.usersAttendedParameters)));


            // Remove empty params from search query
            $scope.usersAttendedParameters = _.compactObject($scope.usersAttendedParameters);

            rewards.getListUsers($scope.usersAttendedParameters)
                .$promise
                .then(function(data){
                    usersAttendedDataTable = angular.extend(usersAttendedDataTable, data);
                    usersAttendedDataTable = angular.extend(usersAttendedDataTable, $scope.usersAttendedParameters);

                    $scope.usersAttendedDataTable = usersAttendedDataTable;
                },function(err){
                    //console.log(err);
                    $scope.errorMessage = err.data.message;
                });
        }else{
            // Remove empty params from search query
            $scope.usersAttendedParameters = _.compactObject($scope.usersAttendedParameters);

            // Query the list
            rewards.getListUsers($scope.usersAttendedParameters)
                .$promise
                .then(function(data){
                    $scope.usersAttendedDataTable = angular.extend(usersAttendedDataTable, data);
                },function(err){
                    //console.log(err);
                    $scope.errorMessage = err.data.message;
                });
        }



        /*
         * LIST USERS WON REWARDS
         * ============================================================================= */

        $scope.usersWonParameters = {
            listType : "won",
            isRewardDelivered : 2,
            rewardId : rewardId,
            currentPage: 1,
            orderBy : "",
            orderDirection : false
        };

        // Submit form filter
        $scope.submitFormFilter = function(){
            // Remove empty params from search query
            $scope.usersWonParameters = _.compactObject($scope.usersWonParameters);

            // Query the list
            rewards.getListUsers($scope.usersWonParameters)
                .$promise
                .then(function(data){
                    $scope.usersWonDataTable.settings = {
                        data : data.data,
                        pagination : data.pagination,
                        currentPage: 1,
                        indexPageArray: 0
                    };
                },function(err){
                    //console.log(err);
                    $scope.errorMessage = err.data.message;
                });
        };

        // Prepare the list settings
        var usersWonDataTable = {
            data : [],
            dateFilter : "MM-dd-yyyy",
            columns : [
                {
                    title : "User ID",
                    data : "userId",
                    isSortable : true
                },
                {
                    title : "Nickname",
                    data : "nickname",
                    isSortable : true
                },
                {
                    title : "Realname",
                    data : "realname",
                    isSortable : true
                },
                {
                    title : "Address",
                    data : "address",
                    isSortable : true
                },
                {
                    title : "Phone",
                    data : "phone",
                    isSortable : true
                },
                {
                    title : "is Reward Delivered ?",
                    data : "isRewardDelivered",
                    isSortable : true,
                    isCheckmark: true
                }
            ],
            clickOnRows : function(rowData){
                $scope.getUserDetail(rowData.userId, "won");
            },
            clickOnPagingItem : function(){
                var _t = this;
                // Get current active page when click on any paging items
                $scope.usersWonParameters.currentPage = _t.getCurrentPage();
            },
            clickOnPrevArrow : function(){
                var _t = this;

                if(_t.getCurrentPage() < _t.getMinPageNumber()){
                    _t.loadMorePrev();
                }
            },
            clickOnNextArrow : function(){
                var _t = this;

                if(_t.getCurrentPage() > _t.getMaxPageNumber()){
                    _t.loadMoreNext();
                }
            },
            clickOnLoadMorePrev : function(){
                var _t = this;

                // Remove empty params from search query
                $scope.usersWonParameters = _.compactObject($scope.usersWonParameters);
                rewards.getListUsers($scope.usersWonParameters)
                    .$promise
                    .then(function(data){
                        _t.refreshData(data);
                    },function(err){
                        //console.log(err);
                        $scope.errorMessage = err.data.message;
                    });
            },
            clickOnLoadMoreNext : function(){
                var _t = this;

                // Remove empty params from search query
                $scope.usersWonParameters = _.compactObject($scope.usersWonParameters);
                rewards.getListUsers($scope.usersWonParameters)
                    .$promise
                    .then(function(data){
                        _t.refreshData(data);
                    },function(err){
                        //console.log(err);
                        $scope.errorMessage = err.data.message;
                    });
            },
            clickOnHeader : function(){
                var _t = this;

                $scope.usersWonParameters.orderDirection = _t.orderDirection;
                $scope.usersWonParameters.orderBy = _t.orderBy;

                // Remove empty params from search query
                $scope.usersWonParameters = _.compactObject($scope.usersWonParameters);
                $scope.usersAttendedParameters.currentPage = 1;

                rewards.getListUsers($scope.usersWonParameters)
                    .$promise
                    .then(function(data){
                        $scope.usersWonDataTable.settings = {
                            data : data.data,
                            pagination : data.pagination,
                            currentPage: 1,
                            indexPageArray: 0
                        };
                    },function(err){
                        //console.log(err);
                        $scope.errorMessage = err.data.message;
                    });
            },
            exportCSV : function(){
                // Remove empty params from search query
                $scope.usersWonParameters = _.compactObject($scope.usersWonParameters);
                $scope.usersWonParameters.exportCSV = true;

                rewards.getListUsers($scope.usersWonParameters)
                    .$promise
                    .then(function(data){
                        // Remove the exportCSV param after finished
                        $scope.usersWonParameters = _.omit($scope.usersWonParameters, ["exportCSV"]);
                        // downloadCSV function is inherit from $rootScope -- see core.js
                        $scope.downloadCSV(data.csvUrl);
                    },function(err){
                        $scope.errorMessage = err.data.message;
                    });
            }
        };


        $scope.successMessage = $routeParams.successMessage;
        $scope.apnMessage = $routeParams.apnMessage;
        $scope.gcmMessage = $routeParams.gcmMessage;
        $scope.mailMessage = $routeParams.mailMessage;

        // Load before view state !
        if(!_.isEmpty(trackingData.rewards.won.parameters)){
            $scope.usersWonDataTable = usersWonDataTable;

            // Extened the search parameters with saved parameters from saved parameters
            _.extend($scope.usersWonParameters, _.pick(trackingData.rewards.won.parameters, _.keys($scope.usersWonParameters)));

            // Remove empty params from search query
            $scope.usersWonParameters = _.compactObject($scope.usersWonParameters);

            rewards.getListUsers($scope.usersWonParameters)
                .$promise
                .then(function(data){
                    usersWonDataTable = angular.extend(usersWonDataTable, data);
                    usersWonDataTable = angular.extend(usersWonDataTable, $scope.usersWonParameters);
                    $scope.usersWonDataTable = usersWonDataTable;
                },function(err){
                    //console.log(err);
                    $scope.errorMessage = err.data.message;
                });
        }else{
            // Remove empty params from search query
            $scope.usersWonParameters = _.compactObject($scope.usersWonParameters);

            // Query the list
            rewards.getListUsers($scope.usersWonParameters)
                .$promise
                .then(function(data){
                    $scope.usersWonDataTable = angular.extend(usersWonDataTable, data);
                },function(err){
                    //console.log(err);
                    $scope.errorMessage = err.data.message;
                });
        }
    }]
);