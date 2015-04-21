app.controller("uiController", ["$scope", "$location", "authServices",
    function($scope, $location, authServices){
        $scope.currentUser = authServices.getCurrentUser();

        $scope.$on("authServices:currentUserLoaded", function(e){
            $scope.currentUser = authServices.getCurrentUser();
        });

        $scope.logout = function(){
            authServices.clearCurrentUser();

            $location.path("/login").search({});
        };
    }
]);