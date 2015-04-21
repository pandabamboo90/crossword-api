app.controller("changePasswordController", ["$scope", "adminsAPIService", "authServices", "$validator",
    function($scope, adminsAPIService, authServices, $validator){

        $scope.currentUser = authServices.getCurrentUser();

        $scope.changePasswordInfo = {
            adminId : $scope.currentUser.adminId,
            currentPassword : "",
            password : "",
            confirmPassword : ""
        };

        $scope.formSuccess = false;

        // Submit form
        $scope.submitForm = function() {
            // Run the validate before submit form
            $validator
                .validate($scope, "changePasswordInfo")
                .success(function(){
                    // Form
                    adminsAPIService.changePassword($scope.changePasswordInfo)
                        .$promise
                        .then(function(data){
                            $scope.changePasswordInfo = {
                                adminId : $scope.currentUser.adminId,
                                currentPassword : "",
                                password : "",
                                confirmPassword : ""
                            };

                            $scope.formSuccess = true;
                            $scope.successMessage = data.message;
                        }, function(err){
                            // Fail to change password
                            $scope.errorMessage = err.data.message;
                        });
                })
                .error(function(err){
                    // Do something when error happen
                    console.info(err)
                });
        }
    }
]);