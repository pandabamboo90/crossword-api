(function(angular, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['angular'], function(angular) {
            return factory(angular);
        });
    } else {
        return factory(angular);
    }
}(angular || null, function(angular) {
    'use strict';

    var app = angular.module("dnDataTableModule", []);

    var dnDataTableController = [ "$scope",
        function($scope){

            $scope.data = [];
            $scope.message = "";

            $scope.pagination = {
                total : 0,
                minPageNumber : 1,
                maxPageNumber : 7,
                rowsPerPage : 10,
                startPageNumber : 1,
                endPageNumber : 10,
                pageArrays : [],
                maxPagesPerQuery : 2
            };

            $scope.indexPageArray = 0;
            $scope.currentPage = 1;
            $scope.showCSVExportButton = true;

            $scope.goToPage = function(indexPageArray){
                if($scope.currentPage != $scope.pagination.pageArrays[indexPageArray]){
                    $scope.currentPage = $scope.pagination.pageArrays[indexPageArray];
                    $scope.indexPageArray = indexPageArray;

                    $scope.clickOnPagingItem();
                }
            };

            $scope.prevPage = function(){
                if ($scope.currentPage > $scope.pagination.startPageNumber) {
                    $scope.currentPage--;
                    $scope.indexPageArray--;

                    $scope.clickOnPagingItem();
                    $scope.clickOnPrevArrow();
                }
            };

            $scope.nextPage = function(){
                if ($scope.currentPage < $scope.pagination.endPageNumber) {
                    $scope.currentPage++;
                    $scope.indexPageArray++;

                    $scope.clickOnPagingItem();
                    $scope.clickOnNextArrow();
                }
            };

            $scope.loadMorePrev = function(){
                $scope.currentPage = $scope.pagination.minPageNumber - 1;
                $scope.indexPageArray = $scope.pagination.maxPagesPerQuery - 1;

                $scope.clickOnPagingItem();
                $scope.clickOnLoadMorePrev();
            };

            $scope.loadMoreNext = function(){
                $scope.currentPage = $scope.pagination.maxPageNumber + 1;
                $scope.indexPageArray = 0;

                $scope.clickOnPagingItem();
                $scope.clickOnLoadMoreNext();
            };


            $scope.sortBy = function(column){
                if(column.isSortable){
                    var tmp = $scope.orderBy;
                    $scope.orderBy = column.data;

                    if($scope.orderDirection !== "undefined"){
                        if(tmp != $scope.orderBy && tmp){
                            $scope.orderDirection = false
                        } else {
                            $scope.orderDirection = !$scope.orderDirection;
                        }
                    }else{
                        $scope.orderDirection = false
                    }
                }
            };


            $scope.checkmarkFilter = function(input){
                if(angular.isDefined(input)){
                    if(typeof(input) == "number")
                        return input == 1 ? "fa fa-check fa-lg text-success" : "fa fa-times fa-lg text-danger";
                    else
                        return input ? "fa fa-check fa-lg text-success" : "fa fa-times fa-lg text-danger";
                }
            };



            // Getter
            $scope.getCurrentPage = function(){
                return $scope.currentPage;
            };
            $scope.getMinPageNumber = function(){
                return $scope.pagination.minPageNumber;
            };
            $scope.getMaxPageNumber = function(){
                return $scope.pagination.maxPageNumber;
            };


            // Setter
            $scope.setCurrentPage = function(pageNumber){
                $scope.currentPage = pageNumber;
            };



            // Refresh Data
            $scope.refreshData = function(newData){
                $scope.data = newData.data;
                $scope.pagination = newData.pagination;
            };



            // callback methods

            // Load more
            $scope.clickOnLoadMorePrev = function(){

            };

            $scope.clickOnLoadMoreNext = function(){

            };


            // Arrows
            $scope.clickOnPrevArrow = function(){

            };

            $scope.clickOnNextArrow = function(){

            };

            // Paging items
            $scope.clickOnPagingItem = function(){

            };

            $scope.exportCSV = function(){

            };
        }
    ];

    app.directive("dnTable",function(){
        return {
            restrict : "E", // Restrict the directive to only Element
            replace : false, // The directive content will be appended inside
            scope : {
                settings : "=" // 2-ways binding scope.settings
            },
            controller: dnDataTableController,
            templateUrl : "templates/dn-data-table-template.html",
            compile: function(tElem, attrs){
                // Do optional DOM transformation here

                return function(scope, element, attrs) {
                    // Linking function here

                    // Watch for any change on the settings and apply the changes
                    scope.$watch("settings", function(){
                        angular.extend(scope, scope.settings); // apply the changes

//                        console.log(scope.settings)
                    }, true);
                }
            }
        }
    });

    app.filter("startFrom", function() {
        return function(input, start) {
            input = input || '';

            start = +start; //parse to int
            return input.slice(start);
        }
    });

    return app
}));


