crosswordApp.controller("usersListController", ["$scope", "$routeParams", "users", "$location", "SERVER_CONFIG", "$validator",
    function($scope, $routeParams, users, $location, SERVER_CONFIG, $validator){
        $scope.searchParameters = {
            userId : "",
            nickname : "",
            dateLastAccessedFrom : "",
            dateLastAccessedTo : "",
            currentPage: 1,
            orderBy : "",
            orderDirection : false
        };

        var usersDataTable = {
            data : [],
            pagination : {
            },
            //dateFilter : "MM-dd-yyyy",
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
                    title : "Access Date",
                    data : "dateLastAccessed",
                    isSortable : true,
                    isDate : true
                },
                {
                    title : "Game Solved",
                    data : "totalGamesSolved",
                    isSortable : true
                },
                {
                    title : "Coins Remain",
                    data : "coinsQuantity",
                    isSortable : true
                },
                {
                    title : "Tickets Used",
                    data : "totalAllTicketsUsed",
                    isSortable : true
                },
                {
                    title : "Rewards Won",
                    data : "totalRewardsWon",
                    isSortable : true
                }
            ],
            clickOnRows : function(rowData){
                $scope.getUserDetailById(rowData.userId);
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
                users.searchUsers($scope.searchParameters)
                    .$promise
                    .then(function(data){
                        _t.refreshData(data);
                    });
            },
            clickOnLoadMoreNext : function(){
                var _t = this;

                $scope.searchParameters = _.compactObject($scope.searchParameters);
                users.searchUsers($scope.searchParameters)
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
                users.searchUsers($scope.searchParameters)
                    .$promise
                    .then(function(data){
                        $scope.usersDataTable.settings = {
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
                $scope.searchParameters = _.compactObject($scope.searchParameters);
                $scope.searchParameters.exportCSV = true;
                // Do the search
                users.searchUsers($scope.searchParameters)
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
         * Search users
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
                    users.searchUsers($scope.searchParameters)
                        .$promise
                        .then(function(data){
                            $scope.usersDataTable.settings = {
                                data : data.data,
                                pagination : data.pagination,
                                currentPage: 1,
                                indexPageArray: 0
                            };

                            $scope.successMessage = data.message;

                        },function(err){
                            //console.log(err);
                            $scope.errorMessage = err.data.message;
                        });
                })
                .error(function(){
                    // Do something when error happen
                });
        };


        /*
         * Change view to the detail user info & save the current search conditions
         */

        $scope.getUserDetailById = function(_userId){
            $scope.searchParameters = _.compactObject($scope.searchParameters);
            $location.path("/users/edit/" + _userId).search($scope.searchParameters);
        };


        /*
         * Load previous search conditions and result table, paging ...
         */

        if(!_.isEmpty($routeParams)){
            $scope.successMessage = $routeParams.successMessage;
            $scope.usersDataTable = usersDataTable;

            _.extend($scope.searchParameters, _.pick($routeParams, _.keys($scope.searchParameters)));

            // Remove empty params from search query
            $scope.searchParameters = _.compactObject($scope.searchParameters);

            users.searchUsers($scope.searchParameters)
                .$promise
                .then(function(data){
                    usersDataTable = angular.extend(usersDataTable, data);
                    usersDataTable = angular.extend(usersDataTable, $scope.searchParameters);

                    $scope.usersDataTable = usersDataTable;
                },function(err){
                    //console.log(err);
                    $scope.errorMessage = err.data.message;
                });
        }else{

            /*
             * Get all users
             */

            users.searchUsers()
                .$promise
                .then(function(data){
                    console.log(data);
                    $scope.usersDataTable = angular.extend(usersDataTable, data);
                },function(err){
                    //console.log(err);
                    $scope.errorMessage = err.data.message;
                });
        }
    }]
);