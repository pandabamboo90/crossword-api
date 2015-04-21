app.controller("changePasswordController", ["$scope", "$location", "adminsAPIService", "$window", "$validator",
    function($scope, $location, adminsAPIService, $window, $validator){
        // User info
        var userId = angular.fromJson($window.sessionStorage.loggedUserInfo).adminId;
        $scope.user = {
            adminId : userId,
            currentPassword : "",
            password : "",
            confirmPassword : ""
        };

        $scope.formSuccess = false;

        // Submit form
        $scope.submitForm = function() {
            // Run the validate before submit form
            $validator
                .validate($scope, "user")
                .success(function(){
                    // Form
                    adminsAPIService.changePassword($scope.user)
                        .$promise
                        .then(function(data){
                            $scope.user = {
                                userId : userId,
                                currentPassword : "",
                                newPassword : "",
                                confirmPassword : ""
                            };

                            $scope.formSuccess = true;
                            $scope.successMessage = data.message;
                        }, function(err){
                            // Fail to change password
                            //console.log(err)
                            $scope.errorMessage = err.data.message;
                        });
                })
                .error(function(){
                    // Do something when error happen
                });
        }
    }
]);