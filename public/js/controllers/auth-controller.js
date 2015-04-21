app.controller("authController", ["$scope", "$location", "adminsAPIService", "authServices", "$timeout", "$window", "$validator", "$routeParams",
    function($scope, $location, adminsAPIService, authServices, $timeout, $window, $validator, $routeParams){
        $scope.formSuccess = false;
        $scope.errorMessage = $routeParams.errorMessage;

        $scope.loginInfo = {
            nickname : "",
            password : "",
            rememberMe : 0
        };

        $scope.submitForm = function(){
            // FIX : Manually trigger the auto event due to a bug in FF !
            angular.element("#nickname, #password").checkAndTriggerAutoFillEvent();

            // Run the validate before submit form
            $validator
                .validate($scope, "loginInfo")
                .success(function(){
                    // Form
                    adminsAPIService.login($scope.loginInfo)
                        .$promise
                        .then(function(data){
                            authServices.setCurrentUser(data.user);
                            $timeout(function(){
                                $location.path("/games").search({});
                            }, 100);
                        }, function(err){
                            $scope.errorMessage = err.data.message;
                        });
                })
                .error(function(err){
                    // Do something when error happen
                    console.info(err);
                });
        };
    }
]);