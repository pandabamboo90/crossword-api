// Include jQuery Date Picker
app.directive("jqDatePicker", function(){
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