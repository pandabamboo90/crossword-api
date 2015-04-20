app.controller("rewardsListController", ["$scope", "$routeParams", "rewards", "$location", "trackingData", "$validator",
    function($scope, $routeParams, rewards, $location, trackingData, $validator){
        // Init the search parameters
        $scope.searchParameters = {
            rewardId : "",
            rewardTitle : "",
            dateCreatedFrom : "",
            dateCreatedTo : "",
            dateEndOfAttendingFrom : "",
            dateEndOfAttendingTo : "",
            dateSweepstakesFrom : "",
            dateSweepstakesTo : "",
            isPremium : 2,
            currentPage: 1,
            orderBy : "",
            orderDirection : false
        };

        var rewardsDataTable = {
            data : [],
            pagination : {
            },
            //dateFilter : "MM-dd-yyyy",
            columns : [
                {
                    title : "Reward ID",
                    data : "rewardId",
                    isSortable : true
                },
                {
                    title : "Title",
                    data : "rewardTitle",
                    isSortable : true
                },
                {
                    title : "Created Date",
                    data : "dateCreated",
                    isSortable : true,
                    isDate : true
                },
                {
                    title : "Deadline ",
                    data : "dateEndOfAttending",
                    isSortable : true,
                    isDate : true
                },
                {
                    title : "Sweepstakes Date",
                    data : "dateSweepstakes",
                    isSortable : true,
                    isDate : true
                },
                {
                    title : "Attended Users",
                    data : "totalUsersAttended",
                    isSortable : true
                },
                {
                    title : "Premium",
                    data : "isPremium",
                    isSortable : true,
                    isCheckmark : true
                }
            ],
            clickOnRows : function(rowData){
                $scope.getRewardDetailById(rowData.rewardId);
            },
            clickOnPagingItem : function(){
                var _t = this;
                // Get current active page when click on any paging items
                $scope.searchParameters.currentPage = _t.getCurrentPage();
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
                $scope.searchParameters = _.compactObject($scope.searchParameters);
                rewards.searchRewards($scope.searchParameters)
                    .$promise
                    .then(function(data){
                        _t.refreshData(data);
                    });
            },
            clickOnLoadMoreNext : function(){
                var _t = this;

                // Remove empty params from search query
                $scope.searchParameters = _.compactObject($scope.searchParameters);
                rewards.searchRewards($scope.searchParameters)
                    .$promise
                    .then(function(data){
                        _t.refreshData(data);
                    });
            },
            clickOnHeader : function(){
                var _t = this;

                $scope.searchParameters.orderDirection = _t.orderDirection;
                $scope.searchParameters.orderBy = _t.orderBy;

                // Remove empty params from search query
                $scope.searchParameters = _.compactObject($scope.searchParameters);
                $scope.searchParameters.currentPage = 1;

                // Do the search
                rewards.searchRewards($scope.searchParameters)
                    .$promise
                    .then(function(data){
                        $scope.rewardsDataTable.settings = {
                            data : data.data,
                            pagination : data.pagination,
                            currentPage: 1,
                            indexPageArray: 0
                        };
                    },function(err){
                        //console.log(err);
                        $scope.errorMessage = err.data.message;
                    }
                );
            },
            exportCSV : function(){
                // Remove empty params from search query
                $scope.searchParameters = _.compactObject($scope.searchParameters);
                $scope.searchParameters.exportCSV = true;

                rewards.searchRewards($scope.searchParameters)
                    .$promise
                    .then(function(data){
                        // Remove the exportCSV param after finished
                        $scope.searchParameters = _.omit($scope.searchParameters, ["exportCSV"]);
                        // downloadCSV function is inherit from $rootScope -- see core.js
                        $scope.downloadCSV(data.csvUrl);
                    },function(err){
                        $scope.errorMessage = err.data.message;
                    });
            }
        };



        /*
         * Search rewards
         */

        $scope.submitForm = function(){
            // Remove empty params from search query
            $scope.searchParameters = _.compactObject($scope.searchParameters);
            $scope.searchParameters.currentPage = 1;

            // Run the validate before submit form
            $validator
                .validate($scope, "searchParameters")
                .success(function(){

                    // Do the search
                    rewards.searchRewards($scope.searchParameters)
                        .$promise
                        .then(function(data){
                            $scope.rewardsDataTable.settings = {
                                data : data.data,
                                pagination : data.pagination,
                                currentPage: 1,
                                indexPageArray: 0
                            };

                            $scope.successMessage = data.message;
                        },function(err){
                            //console.log(err);
                            $scope.errorMessage = err.data.message;
                        }
                    );
                })
                .error(function(){
                    // Do something when error happen
                });
        };


        /*
         * Change view to the detail reward info & save the current search conditions
         */

        $scope.getRewardDetailById = function(_rewardId){
            // Remove empty params from search query
            $scope.searchParameters = _.compactObject($scope.searchParameters);

            // Save search parameters before change view for showing result when go back to this view later
            trackingData.rewards.list.searchParameters = $scope.searchParameters;

            // Empty all inner views parameter, start a new scope
            trackingData.rewards.attended = {};
            trackingData.rewards.won = {};

            // Change view
            $location.path("/rewards/edit/" + _rewardId);
        };



        /*
         * Load previous search conditions and result table, paging base on tracking data
         */

        $scope.successMessage = $routeParams.successMessage;

        // Clear all tracking data first
        trackingData.rewards.empty();

        if(!_.isEmpty(trackingData.rewards.list.searchParameters)){
            $scope.rewardsDataTable = rewardsDataTable;

            // Extened the search parameters with saved parameters from reward list
            _.extend($scope.searchParameters, _.pick(trackingData.rewards.list.searchParameters, _.keys($scope.searchParameters)));

            // Remove empty params from search query
            $scope.searchParameters = _.compactObject($scope.searchParameters);

            rewards.searchRewards($scope.searchParameters)
                .$promise
                .then(function(data){
                    rewardsDataTable = angular.extend(rewardsDataTable, data);
                    rewardsDataTable = angular.extend(rewardsDataTable, $scope.searchParameters);

                    $scope.rewardsDataTable = rewardsDataTable;
                },function(err){
                    //console.log(err);
                    $scope.errorMessage = err.data.message;
                });
        }else{

            /*
             * Get all rewards
             */

            rewards.searchRewards()
                .$promise
                .then(function(data){
                    $scope.rewardsDataTable = angular.extend(rewardsDataTable, data);
                },function(err){
                    //console.log(err);
                    $scope.errorMessage = err.data.message;
                });
        }
    }]
);