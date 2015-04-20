app.controller("otherContentController", ["$scope", "$routeParams", "$location", "otherContent",
    function($scope, $routeParams, $location, others){
        var contentType = $routeParams.contentType;

        others.query({
                contentType : contentType
            })
            .$promise
            .then(function(data){
                $scope.contentData = data[0];
            }, function(err){
                //console.log(err);
                $scope.errorMessage = err.data.message;
            });


        $scope.updateContent = function(){
            $scope.contentData.$updateContent({
                contentType : contentType
            }, function(data){
                $scope.contentData = data.data;
                $scope.successMessage = data.message
            }, function(err){
                //console.log(err);
                $scope.errorMessage = err.data.message;
            });
        }
    }]
);