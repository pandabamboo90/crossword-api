app.config(["$validatorProvider",
    function($validatorProvider){
        $validatorProvider.register("requiredBlur", {
            invoke: "blur",
            validator: /.+/,
            error : function(value, scope, element, attrs, $injector){
                var message = "This field is required.";

                if(element.val() && attrs.validatorRequiredMessage){
                    message = attrs.validatorRequiredMessage;
                }
                $validatorProvider.convertError(message)(value, scope, element, attrs)
            }
        });

        $validatorProvider.register("matchField", {
            invoke: "blur",
            validator: function(value, scope, element, attrs, $injector){
                return angular.element("#" + attrs.validatorMatchWith).val() === value
            },
            error : function(value, scope, element, attrs, $injector){
                var message = "Confirm password and new password doesn't match.";

                if(element.val() && attrs.validatorMatchFieldMessage){
                    message = attrs.validatorMatchFieldMessage;
                }
                $validatorProvider.convertError(message)(value, scope, element, attrs)
            }
        });

        $validatorProvider.register("notHaveSpecialChars", {
            invoke: "watch",
            validator: /^((?!([*'[\]\^%?#＾])).)*$/,
            error : function(value, scope, element, attrs, $injector){
                var message = "Special characters is not allowed.";

                if(element.val() && attrs.validatorNotHaveSpecialCharsMessage){
                    message = attrs.validatorNotHaveSpecialCharsMessage;
                }

                $validatorProvider.convertError(message)(value, scope, element, attrs)
            }
        });

        $validatorProvider.register("dateBefore", {
            invoke: "watch",
            validator: function(value, scope, element, attrs, $injector){
                if(element.val() && attrs.validatorDateBefore.length > 0){
                    return new Date(value).compareTo(new Date(attrs.validatorDateBefore).clearTime()) <= 0
                }else{
                    return true
                }
            },
            error : function(value, scope, element, attrs, $injector){
                var message = "From Date must be before To Date";

                if(element.val() && attrs.validatorDateBeforeMessage){
                    message = attrs.validatorDateBeforeMessage;
                }

                $validatorProvider.convertError(message)(value, scope, element, attrs)
            }
        });

        $validatorProvider.register("dateAfter", {
            invoke: "watch",
            validator: function(value, scope, element, attrs, $injector){
                if(element.val() && attrs.validatorDateAfter.length > 0){
                    return new Date(value).compareTo(new Date(attrs.validatorDateAfter).clearTime()) > -1
                }else{
                    return true
                }
            },
            error : function(value, scope, element, attrs, $injector){
                var message = "To Date must be after From Date";

                if(element.val() && attrs.validatorDateAfterMessage){
                    message = attrs.validatorDateAfterMessage;
                }

                $validatorProvider.convertError(message)(value, scope, element, attrs)
            }
        });

        $validatorProvider.register("urlOptional", {
            invoke: "watch",
            validator: function(value, scope, element, attrs, $injector){
                var val = element.val();
                var RegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
                if(val.length > 0){
                    return RegEx.test(val);
                }else{
                    return true
                }
            },
            error : function(value, scope, element, attrs, $injector){
                var message = "This field should be the url.";

                if(element.val() && attrs.validatorUrlMessage){
                    message = attrs.validatorUrlMessage;
                }

                $validatorProvider.convertError(message)(value, scope, element, attrs)
            }
        });
    }
]);