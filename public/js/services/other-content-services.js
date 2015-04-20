app.factory("otherContent", ["$resource", "SERVER_CONFIG",
    function ($resource, SERVER_CONFIG) {
        return $resource(SERVER_CONFIG.apiUrl() + "/:contentType", {
            contentType : "@contentType"
        }, {
            updateContent : {
                method : "PUT"
            }
        });
    }
]);