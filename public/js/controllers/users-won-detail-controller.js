crosswordApp.controller("detailUserWonController", ["$scope", "$routeParams", "rewards", "$location", "$validator",
    function($scope, $routeParams, rewards, $location, $validator){
        var dateFields = [
                "dateCreated",
                "dateReviewConfirmAppear",
                "dateSubmitReview",
                "dateLastAccessed"
            ],
            rewardId = $routeParams.rewardId,
            listType = $routeParams.listType,
            userId = $routeParams.userId;

        rewards.getUserDetail({
            rewardId : rewardId,
            listType : listType,
            userId : userId
        }, function(data){
            $scope.user = data[0];

            // Change Date format to display on inputs
            _.changeDateFormat(dateFields, $scope.user);
        },function(err){
            //console.log(err);
            $scope.errorMessage = err.data.message;
        });

        $scope.submitForm = function(){
            // Run the validate before submit form
            $validator
                .validate($scope, "user")
                .success(function(){
                    console.log($scope.user);

                    $scope.user.$updateUserWinOrLose({
                        rewardId : rewardId,
                        listType : listType,
                        userId : userId
                    },function(data){
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
            _.each($location.$$search, function(v, k){

                if(k == "apnMessage" || k == "gcmMessage" || k == "mailMessage")
                    delete $location.$$search[k]
            });

            $location.$$compose();
            $location.path("/rewards/edit/" + rewardId).search("successMessage", message);
        };



        /*
         * ATTENDED HISTORY OF USERS
         * ============================================================================= */

        $scope.attendedHistoryParameters = {
            listType : "attended",
            rewardId : rewardId,
            userId : userId,
            currentPage: 1,
            orderBy : "",
            orderDirection : false
        };

        var attendedHistoryDataTable = {
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
                    isSortable : false
                },
                {
                    title : "Last Attended Date ",
                    data : "dateLastTicketsUsed",
                    isSortable : true,
                    isDate : true
                },
                {
                    title : "Total Tickets Used",
                    data : "totalTicketsUsed",
                    isSortable : true
                },
                {
                    title : "Won ?",
                    data : "winOrLose",
                    isSortable : true,
                    isCheckmark: true
                },
                {
                    title : "Comment",
                    data : "userComment",
                    isSortable : true
                }
            ],
            clickOnRows : function(rowData){
                //$location.path("/rewards/" + rowData.rewardId + "/users/" + listType + "/" + rowData.userId);
            },
            clickOnPagingItem : function(){
                var _t = this;
                // Get current active page when click on any paging items
                $scope.attendedHistoryParameters.currentPage = _t.getCurrentPage();
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
                $scope.attendedHistoryParameters = _.compactObject($scope.attendedHistoryParameters);

                rewards.getAttendedHistory($scope.attendedHistoryParameters)
                    .$promise
                    .then(function(data){
                        _t.refreshData(data);
                    });
            },
            clickOnLoadMoreNext : function(){
                var _t = this;

                // Remove empty params from search query
                $scope.attendedHistoryParameters = _.compactObject($scope.attendedHistoryParameters);

                rewards.getAttendedHistory($scope.attendedHistoryParameters)
                    .$promise
                    .then(function(data){
                        _t.refreshData(data);
                    });
            },
            clickOnHeader : function(){
                var _t = this;

                $scope.attendedHistoryParameters.orderDirection = _t.orderDirection;
                $scope.attendedHistoryParameters.orderBy = _t.orderBy;
            },
            showCSVExportButton : false
        };

        // Remove empty params from search query
        $scope.attendedHistoryParameters = _.compactObject($scope.attendedHistoryParameters);

        rewards.getAttendedHistory($scope.attendedHistoryParameters)
            .$promise
            .then(function(data){
                $scope.attendedHistoryDataTable = angular.extend(attendedHistoryDataTable, data)
            },function(err){
                //console.log(err);
                $scope.errorMessage = err.data.message;
            });
    }]
);