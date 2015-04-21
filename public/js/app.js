// all angular code for our app

var app = angular.module("crossword-app", [
    "ngRoute",
    "ngSanitize",
    "ngResource",
    "dnDataTableModule",
    "cwGeneratorModule",
    "angularFileUpload",
    "ui.tinymce",
    "validator",
    "validator.rules"
]).constant("SERVER_CONFIG", {
        hostUrl : function(){
            return location.protocol + "//" + location.host
        },
        apiUrl :function(){
            return this.hostUrl() + "/api"
        }
    })
    .run(["$rootScope", "$location", "$window",
        function($rootScope, $location, $window) {
            $rootScope.isActive = function (viewLocation) {
                return $location.path().indexOf(viewLocation) == 0;
            };

            $rootScope.downloadCSV = function(url){
                angular.element("<a />", {
                    href : url,
                    target : "_blank"
                }).click(function(){
                    window.location = angular.element(this).attr("href");
                }).trigger("click");
            };

            $rootScope.tinymceOptions = {
                theme: "modern",
                skin : "light",
                resize: false,
                plugins: "advlist autolink charmap code emoticons image hr print textcolor searchreplace spellchecker table wordcount",
                toolbar: "cut copy paste | alignleft aligncenter alignright alignjustify | bold italic underline strikethrough | styleselect  fontselect fontsizeselect | formatselect removeformat | bullist numlist | outdent indent | blockquote |  subscript superscript | forecolor backcolor | image charmap | print | spellchecker | searchreplace | code | table | emoticons"
            };


            // Check user logged in, if not - redirect to login page
            $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
                // Check token existed and user already logged in -> Use it to access API server
                if($window.sessionStorage.token && $window.sessionStorage.loggedUserInfo){
                    $rootScope.loggedUserInfo = angular.fromJson($window.sessionStorage.loggedUserInfo);
                    $rootScope.showNav = true;
                }

//                if(nextRoute.originalPath == "/login" || (nextRoute.access && nextRoute.access.requiredLogin && !angular.isObject($rootScope.loggedUserInfo))){
//                    $rootScope.loggedUserInfo = null;
//                    $rootScope.showNav = false;
//
//                    delete $window.sessionStorage.loggedUserInfo;
//                    delete $window.sessionStorage.token;
//
//                    $location.path("/login");
//                }

                console.log($rootScope.loggedUserInfo);

                if(nextRoute.access && nextRoute.access.requiredLogin && !angular.isObject($rootScope.loggedUserInfo)){
//                    $rootScope.loggedUserInfo = null;
                    $rootScope.showNav = false;

                    delete $window.sessionStorage.token;

                    $location.path("/login").search({
                        errorMessage : "Permission denied. Please login."
                    });
                }
            });
        }
    ]);