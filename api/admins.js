module.exports = function(app, router, pool, _u, appFunction, globalSettings, email, apn, fastCSV, path, fs){
    var knex = app.get("knex"),
        Promise = app.get("Promise"),
        bcrypt = app.get("bcrypt");


    /* CHANGE PASSWORD
     * ====================================================================== */

    router.put("/admins/:adminId/change-password", function(req, res){
        var requestBody = req.body,
            admin = null,
            currentPassword = requestBody.currentPassword,
            newPassword = requestBody.password,
            ne2Password = requestBody.confirmPassword;

        if(newPassword != ne2Password){
            res.send(400, { message : globalSettings.errorMessage.newPasswordNotMatch });
        }else{
            knex.select("*")
                .from("admins")
                .where("admin_id", req.params["adminId"])
                .then(function(_admin){
                    admin = appFunction.convertQueryResultData(_admin)[0];
                    return bcrypt.compareAsync(currentPassword, admin.password);
//                    return true
                })
                .then(function(matched){
                    if(!matched) return Promise.reject(new Error(globalSettings.errorMessage.wrongPassword));

                    return bcrypt.genSaltAsync();
                })
                .then(function(salt){
                    return bcrypt.hashAsync(newPassword, salt);
                })
                .then(function(hash){
                    knex("admins")
                        .update("password", hash)
                        .where("admin_id", req.params["adminId"])
                        .then(function(){
                            res.json({
                                message : globalSettings.message.passwordUpdate
                            })
                        })
                })
                .catch(function(err){
                    res.send(400, { message : err.toString() });
                });
        }
    });
};