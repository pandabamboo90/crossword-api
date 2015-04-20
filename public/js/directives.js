// Include jQuery Date Picker
crosswordApp.directive("jqDatePicker", function(){
    return {
        restrict: "AC",
        scope : {},
        link: function(scope, element, attrs) {
            element.datepicker({
                todayBtn: "linked",
                language: "ja",
                autoclose: true,
                //format: "mm-dd-yyyy",
                todayHighlight: true,
                orientation: "top auto"
            });

            setTimeout(function(){
                var currentDate = element.find("input").val();
                element.datepicker("update", currentDate);
            },500);
        }
    }
});


crosswordApp.directive("bootstrapTabs", function () {
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

crosswordApp.directive("metisMenu", function(){
    return {
        restrict: "AC",
//        scope : true, // Inherit the scope
        scope : {},
        link: function (scope, element, attrs) {
            //console.log(element);

            element.metisMenu();

            //Loads the correct sidebar on window load,
            //collapses the sidebar on window resize.
            // Sets the min-height of #page-wrapper to window size

            $(window).bind("load resize", function() {
                var topOffset = 50,
                    width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
                if (width < 768) {
                    $("div.navbar-collapse").addClass("collapse");
                    topOffset = 100; // 2-row-menu
                } else {
                    $("div.navbar-collapse").removeClass("collapse")
                }

                var height = (this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height;
                    height = height - topOffset;
                if (height < 1) height = 1;
                if (height > topOffset) {
                    $("#page-wrapper").css("min-height", (height) + "px");
                }
            })
        }
    };
});