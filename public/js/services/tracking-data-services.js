app.factory("trackingData", [
    function(){
        return {
            rewards : {
                list : {},
                attended : {},
                won : {},
                activeTabId : "",
                empty : function(){
                    this.activeTabId = "";
                    this.list = {};
                    this.attended = {};
                    this.won = {};
                }
            }
        }
    }
]);