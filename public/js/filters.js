crosswordApp.filter("checkmark", function() {
    return function(input) {

        if(typeof(input) == "number")
            return input == 1 ? "fa fa-check fa-lg text-success" : "fa fa-times fa-lg text-danger";
        else
            return input ? "fa fa-check fa-lg text-success" : "fa fa-times fa-lg text-danger";
    };
});