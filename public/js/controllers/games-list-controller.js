crosswordApp.controller("gamesListController", ["$scope", "$routeParams", "games", "$location", "$validator",
    function($scope, $routeParams, games, $location, $validator){
        $scope.searchParameters = {
            gameId : "",
            gameTitle : "",
            dateCreatedFrom : "",
            dateCreatedTo : "",
            currentPage: 1,
            orderBy : "",
            orderDirection : false,
            isPremium : 2
        };

        var gamesDataTable = {
            data : [],
            pagination : {
            },
            //dateFilter : "MM-dd-yyyy",
            columns : [
                {
                    title : "Game ID",
                    data : "gameId",
                    isSortable : true
                },
                {
                    title : "Title",
                    data : "gameTitle",
                    isSortable : true
                },
                {
                    title : "Created Date",
                    data : "dateCreated",
                    isSortable : true,
                    isDate : true
                },
                {
                    title : "Users Played",
                    data : "totalUsersPlayed",
                    isSortable : true
                },
                {
                    title : "Users Solved",
                    data : "totalUsersSolved",
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
                $scope.getGameDetailById(rowData.gameId);
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
                games.searchGames($scope.searchParameters)
                    .$promise
                    .then(function(data){
                        _t.refreshData(data);
                    });
            },
            clickOnLoadMoreNext : function(){
                var _t = this;

                // Remove empty params from search query
                $scope.searchParameters = _.compactObject($scope.searchParameters);
                games.searchGames($scope.searchParameters)
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
                games.searchGames($scope.searchParameters)
                    .$promise
                    .then(function(data){
                        $scope.gamesDataTable.settings = {
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

                games.searchGames($scope.searchParameters)
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
         * Search games
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
                    games.searchGames($scope.searchParameters)
                        .$promise
                        .then(function(data){
                            $scope.gamesDataTable.settings = {
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
         * Change view to the detail game info & save the current search conditions
         */

        $scope.getGameDetailById = function(_gameId){
            $scope.searchParameters = _.compactObject($scope.searchParameters);
            $location.path("/games/edit/" + _gameId).search($scope.searchParameters);
        };


        /*
         * Load previous search conditions and result table, paging ...
         */

        if(!_.isEmpty($routeParams)){
            $scope.successMessage = $routeParams.successMessage;
            $scope.gamesDataTable = gamesDataTable;

            _.extend($scope.searchParameters, _.pick($routeParams, _.keys($scope.searchParameters)));

            // Remove empty params from search query
            $scope.searchParameters = _.compactObject($scope.searchParameters);

            games.searchGames($scope.searchParameters)
                .$promise
                .then(function(data){
                    gamesDataTable = angular.extend(gamesDataTable, data);
                    gamesDataTable = angular.extend(gamesDataTable, $scope.searchParameters);

                    $scope.gamesDataTable = gamesDataTable;
                },function(err){
                    //console.log(err);
                    $scope.errorMessage = err.data.message;
                });
        }else{

            /*
             * Get all games
             */

            games.searchGames()
                .$promise
                .then(function(data){
                    gamesDataTable.data = data.data;
                    gamesDataTable.pagination = data.pagination;

                    $scope.gamesDataTable = angular.extend(gamesDataTable, data);
                },function(err){
                    //console.log(err);
                    $scope.errorMessage = err.data.message;
                });
        }
    }]
);