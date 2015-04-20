
_.mixin({

    /*
     * Remove object properties with empty value, null, undefined
     */

    compactObject : function(o) {
        var clone = _.clone(o);
        _.each(clone, function(v, k) {
            if(!v || _.isUndefined(v)) {
                delete clone[k];
            }
        });
        return clone;
    },
    
    changeDateFormat : function(dateFields, o, dateOutputFormat) {
        var dateOutputFormat = _.isUndefined(dateOutputFormat) ? "yyyy/MM/dd" : dateOutputFormat;

        _.each(dateFields, function(k){
            if(!_.isEmpty(o[k])){
                o[k] = Date.parse(o[k]).toString(dateOutputFormat);
            }
        });
    }
});