// all angular code for our app

var app = angular.module("crossword-app", [
    "ngRoute",
    "ngSanitize",
    "dnDataTableModule",
    "cwGeneratorModule",
    "app",
    "angularFileUpload",
    "ui.tinymce",
    "validator",
    "validator.rules"
]);

app
    .constant("SERVER_CONFIG", {
        hostUrl : function(){
//            return "http://gumiviet-dn.no-ip.org:5000"
            return "http://dev.gumiviet.com:5000";
        },
        apiUrl :function(){
            return this.hostUrl() + "/api"
        }
    })
    .config(["$routeProvider", "$locationProvider", "$httpProvider", "$validatorProvider",
        function($routeProvider, $locationProvider, $httpProvider, $validatorProvider){
            // use the HTML5 History API
//            $locationProvider.html5Mode(true);

//            $routeProvider
//                .when("/login", {
//                    templateUrl : "views/login.html",
//                    controller : "authController",
//                    access: { requiredLogin: false }
//                })
//                .when("/change-password", {
//                    templateUrl : "views/change-password.html",
//                    controller : "changePasswordController",
//                    access: { requiredLogin: true }
//                })
//                .when("/users", {
//                    templateUrl : "views/users/list-all-users.html",
//                    controller : "usersListController",
//                    access: { requiredLogin: true }
//                })
//                .when("/users/add", {
//                    templateUrl : "views/users/add-user.html",
//                    controller : "userAddController",
//                    access: { requiredLogin: true }
//                })
//                .when("/users/edit/:userId", {
//                    templateUrl : "views/users/detail-user.html",
//                    controller : "userDetailController",
//                    access: { requiredLogin: true }
//                })
//                .when("/games", {
//                    templateUrl : "views/games/list-all-games.html",
//                    controller : "gamesListController",
//                    access: { requiredLogin: true }
//                })
//                .when("/games/add", {
//                    templateUrl : "views/games/add-game.html",
//                    controller : "gameAddController",
//                    access: { requiredLogin: true }
//                })
//                .when("/games/edit/:gameId", {
//                    templateUrl : "views/games/detail-game.html",
//                    controller : "gameDetailController",
//                    access: { requiredLogin: true }
//                })
//                .when("/rewards", {
//                    templateUrl : "views/rewards/list-all-rewards.html",
//                    controller : "rewardsListController",
//                    access: { requiredLogin: true }
//                })
//                .when("/rewards/add", {
//                    templateUrl : "views/rewards/add-reward.html",
//                    controller : "rewardAddController",
//                    access: { requiredLogin: true }
//                })
//                .when("/rewards/edit/:rewardId", {
//                    templateUrl : "views/rewards/detail-reward.html",
//                    controller : "rewardDetailController",
//                    access: { requiredLogin: true }
//                })
//                .when("/rewards/edit/:rewardId/users/:listType/edit/:userId", {
//                    templateUrl : function(routeParams){
//                        return "views/rewards/detail-user-" + routeParams.listType + ".html";
//                    },
//                    access: { requiredLogin: true }
//                })
//                .when("/:contentType", {
//                    templateUrl : function(routeParams){
//                        return "views/other-content/" + routeParams.contentType + ".html";
//                    },
//                    controller : "otherContentController",
//                    access: { requiredLogin: true }
//                })
//                .otherwise({
//                    redirectTo : "/login"
//                });
//
//
//
////            $httpProvider.defaults.useXDomain = true;
////            delete $httpProvider.defaults.headers.common['X-Requested-With'];
//
//            $httpProvider.interceptors.push("tokenInterceptor");


            //# blur - required
//            $validatorProvider.register("requiredBlur", {
//                invoke: "blur",
//                validator: /.+/,
//                error : function(value, scope, element, attrs, $injector){
//                    var message = "This field is required.";
//
//                    if(element.val() && attrs.validatorRequiredMessage){
//                        message = attrs.validatorRequiredMessage;
//                    }
//                    $validatorProvider.convertError(message)(value, scope, element, attrs)
//                }
//            });
//
//            $validatorProvider.register("matchField", {
//                invoke: "blur",
//                validator: function(value, scope, element, attrs, $injector){
//                    return angular.element("#" + attrs.validatorMatchWith).val() === value
//                },
//                error : function(value, scope, element, attrs, $injector){
//                    var message = "Confirm password and new password doesn't match.";
//
//                    if(element.val() && attrs.validatorMatchFieldMessage){
//                        message = attrs.validatorMatchFieldMessage;
//                    }
//                    $validatorProvider.convertError(message)(value, scope, element, attrs)
//                }
//            });
//
//            $validatorProvider.register("notHaveSpecialChars", {
//                invoke: "watch",
//                validator: /^((?!([*'[\]\^%?#＾])).)*$/,
//                error : function(value, scope, element, attrs, $injector){
//                    var message = "Special characters is not allowed.";
//
//                    if(element.val() && attrs.validatorNotHaveSpecialCharsMessage){
//                        message = attrs.validatorNotHaveSpecialCharsMessage;
//                    }
//
//                    $validatorProvider.convertError(message)(value, scope, element, attrs)
//                }
//            });
//
//            $validatorProvider.register("dateBefore", {
//                invoke: "watch",
//                validator: function(value, scope, element, attrs, $injector){
//                    if(element.val() && attrs.validatorDateBefore.length > 0){
//                        return new Date(value).compareTo(new Date(attrs.validatorDateBefore).clearTime()) <= 0
//                    }else{
//                        return true
//                    }
//                },
//                error : function(value, scope, element, attrs, $injector){
//                    var message = "From Date must be before To Date";
//
//                    if(element.val() && attrs.validatorDateBeforeMessage){
//                        message = attrs.validatorDateBeforeMessage;
//                    }
//
//                    $validatorProvider.convertError(message)(value, scope, element, attrs)
//                }
//            });
//
//            $validatorProvider.register("dateAfter", {
//                invoke: "watch",
//                validator: function(value, scope, element, attrs, $injector){
//                    if(element.val() && attrs.validatorDateAfter.length > 0){
//                        return new Date(value).compareTo(new Date(attrs.validatorDateAfter).clearTime()) > -1
//                    }else{
//                        return true
//                    }
//                },
//                error : function(value, scope, element, attrs, $injector){
//                    var message = "To Date must be after From Date";
//
//                    if(element.val() && attrs.validatorDateAfterMessage){
//                        message = attrs.validatorDateAfterMessage;
//                    }
//
//                    $validatorProvider.convertError(message)(value, scope, element, attrs)
//                }
//            });
//
//            $validatorProvider.register("urlOptional", {
//                invoke: "watch",
//                validator: function(value, scope, element, attrs, $injector){
//                    var val = element.val();
//                    var RegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
//                    if(val.length > 0){
//                        return RegEx.test(val);
//                    }else{
//                        return true
//                    }
//                },
//                error : function(value, scope, element, attrs, $injector){
//                    var message = "This field should be the url.";
//
//                    if(element.val() && attrs.validatorUrlMessage){
//                        message = attrs.validatorUrlMessage;
//                    }
//
//                    $validatorProvider.convertError(message)(value, scope, element, attrs)
//                }
//            });
        }
    ])
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