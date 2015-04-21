app.directive("bootstrapTabs", function () {
    return {
        restrict: "AC",
        scope : {},
        link: function (scope, element, attrs) {
            element.find("a").click(function(e) {
                e.preventDefault();
                $(this).tab("show");
            });
        }
    };
});