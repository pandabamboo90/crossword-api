module.exports = function(app, router, pool, _u, appFunction, globalSettings, email, apn, gcm, fastCSV, path, fs, log){
    require("./admins")         (app, router, pool, _u, appFunction, globalSettings, email, apn, fastCSV, path, fs, log);
    require("./users")          (app, router, _u, appFunction, globalSettings, log);
    require("./games")          (app, router, _u, appFunction, globalSettings, log);
    require("./rewards")        (app, router, pool, _u, appFunction, globalSettings, email, apn, gcm, fastCSV, path, fs, log);
    require("./other-contents") (app, router, pool, _u, appFunction, globalSettings, email, apn, fastCSV, path, fs, log);
    require("./sync")           (app, router, pool, _u, appFunction, globalSettings, email, apn, fastCSV, path, fs, log);
};