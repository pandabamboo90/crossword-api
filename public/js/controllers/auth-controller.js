app.controller("authController", ["$scope", "$location", "adminsAPIService", "trackingData", "$rootScope", "$window", "$validator", "$routeParams",
    function($scope, $location, adminsAPIService, trackingData, $rootScope, $window, $validator, $routeParams){
        $scope.formSuccess = false;
        $scope.errorMessage = $routeParams.errorMessage;
        //console.log($routeParams);

        $scope.user = {
            nickname : "",
            password : "",
            rememberMe : 0
        };

        if($window.sessionStorage.loggedUserInfo){
            $scope.user = angular.fromJson($window.sessionStorage.loggedUserInfo);
            if($scope.user.rememberMe == 1){
                $scope.user.rememberMe = true;
            }else{
                delete $window.sessionStorage.loggedUserInfo;
                $scope.user = {
                    nickname : "",
                    password : "",
                    rememberMe : false
                };
            }
        }


        $scope.submitForm = function(){
            // FIX : Manually trigger the auto event due to a bug in FF !
            angular.element("#nickname, #password").checkAndTriggerAutoFillEvent();

            // Run the validate before submit form
            $validator
                .validate($scope, "user")
                .success(function(){
                    // Form
                    adminsAPIService.login($scope.user)
                        .$promise
                        .then(function(data){
                            if(data.token && data.user){
                                console.log(data);

                                $rootScope.loggedUserInfo = data.user;
                                $rootScope.showNav = true;

                                $window.sessionStorage.loggedUserInfo = angular.toJson(data.user);
                                $window.sessionStorage.token = data.token;
                                $location.path("/games").search({});

                                console.log($window.sessionStorage.loggedUserInfo);
                            }
                        }, function(err){
                            //console.log(err)
                            $scope.errorMessage = err.data.message;
                        });
                })
                .error(function(){
                    // Do something when error happen
                });
//            console.log($scope.user.rememberMe);
        };


        $scope.logout = function(){
//            $rootScope.loggedUserInfo = null;
            $rootScope.showNav = false;

//            delete $window.sessionStorage.loggedUserInfo;
            delete $window.sessionStorage.token;

            $location.path("/login");
        };
    }
]);