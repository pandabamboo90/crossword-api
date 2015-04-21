app.factory("tokenInterceptor", ["$rootScope", "$q", "$window", "$location",
    function ($rootScope, $q, $window, $location) {
        return {
            // On request success
            request: function (config) {
                config.headers = config.headers || {};

                // Attach the token to header for authenticate with server
                if ($window.sessionStorage.token) {
                    config.headers.Authorization = "Bearer " + $window.sessionStorage.token;
                }
                return config || $q.when(config);
            },
            requestError: function(request){

                // Throw out the error
                return $q.reject(request);
            },
            // On response success
            response: function (response) {

                return response || $q.when(response);
            },
            // On response failture
            responseError: function (response) {

                // The response contains the data about the error.
                if (response.status === 401) {
                    //                    $rootScope.loggedUserInfo = null;
                    $rootScope.showNav = false;

                    //                    delete $window.sessionStorage.loggedUserInfo;
                    delete $window.sessionStorage.token;

                    //console.log(response);
                    // Login again to renew the token
                    $location.path("/login").search({
                        errorMessage : "Your session has been expired. Please login again."
                    });
                }

                // Throw out the error
                return $q.reject(response);
            }
        };
    }
]);