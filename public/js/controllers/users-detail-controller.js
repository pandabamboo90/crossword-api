app.controller("userDetailController", ["$scope", "$routeParams", "users", "$location", "$validator",
    function($scope, $routeParams, users, $location, $validator){
        var dateFields = [
            "dateCreated",
            "dateReviewConfirmAppear",
            "dateSubmitReview",
            "dateLastAccessed",
            "dateGetDailyCoins",
            "dateLastCoinsUsed"
        ];

        users.query({
            userId : $routeParams.userId
        }, function(data){
            $scope.user = data[0];

            // Change Date format to display on inputs
            _.changeDateFormat(dateFields, $scope.user);
        },function(err){
            //console.log(err);
            $scope.errorMessage = err.data.message;
        });

        $scope.submitForm = function(isValid){
            // Run the validate before submit form
            $validator
                .validate($scope, "user")
                .success(function(){
                    $scope.user.$updateUser(function(data){
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
            $location.path("/users").search("successMessage", message);
        };
    }]
);