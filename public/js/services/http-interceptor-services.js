app.factory("tokenInterceptor", ["$rootScope", "$q", "$location", "authServices", "$localStorageService",
    function ($rootScope, $q, $location, authServices, $localStorageService) {
        return {
            // On request success
            request: function (config) {
                config.headers = config.headers || {};

                // Attach the token to header for authenticate with server
                var currentUser = $localStorageService.getObject("currentUser");
                if (currentUser) {
                    authServices.setCurrentUser(currentUser);
                    config.headers.Authorization = "Bearer " + authServices.getCurrentUser().token;
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
                    authServices.clearCurrentUser();

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