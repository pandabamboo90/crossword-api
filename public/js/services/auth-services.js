app.factory("authServices", ["$rootScope", "$localStorageService",
    function($rootScope, $localStorageService){
        var currentUser = null;

        var getCurrentUser = function(){
            return currentUser
        };

        var setCurrentUser = function(_user){
            currentUser = _user;

            $localStorageService.setObject("currentUser", _user);
            $rootScope.$broadcast("authServices:currentUserLoaded");
        };

        var clearCurrentUser = function(){
            currentUser = null;

            $localStorageService.setObject("currentUser", null);
            $rootScope.$broadcast("authServices:currentUserLoaded");
        };

        return {
            getCurrentUser : getCurrentUser,
            setCurrentUser : setCurrentUser,
            clearCurrentUser : clearCurrentUser
        }
    }
]);