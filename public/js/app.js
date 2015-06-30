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
    .run(["$rootScope", "$location", "$localStorageService", "authServices",
        function($rootScope, $location, $localStorageService, authServices) {
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
                var currentUser = $localStorageService.getObject("currentUser");
                // Not yet logged in -> Redirect
                if($.isEmptyObject(currentUser)){
                    if(nextRoute.access && nextRoute.access.requiredLogin){
                        console.log(nextRoute.access);
                        $location.path("/login").search({
                            errorMessage : "You have to login first."
                        });
                    }
                }else{
                    // Already logged in, check token session
                    var currentTime = new Date();
                    var expireTime = new Date(currentUser.exp * 1000);

                    // Token expired -> Request a new one
                    if(currentTime.compareTo(expireTime) >= 0){
                        authServices.clearCurrentUser();
                        $location.path("/login").search({
                            errorMessage : "Session expired."
                        });
                    }
                }
            });
        }
    ]);