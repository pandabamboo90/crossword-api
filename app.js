/*
 * Set up app
 * ======================================================================
 */

var express = require("express"),
    app = express(),
    http = require("http"),
    server = http.createServer(app),
    bodyParser = require("body-parser"),
    cors = require("cors"),
    morgan = require("morgan"),
    busboy = require("busboy"),
    path = require("path"),
    _u = require("underscore"),
    fs = require("fs"),
    fastCSV = require("fast-csv"),
    datejs = require("datejs"),
    email   = require("emailjs"),
    apn = require("apn"),
    gcm = require("node-gcm"),
    bunyan = require("bunyan"),
    log = bunyan.createLogger({
        name: "Crossword API",
        src : true,
        streams: [
            {
                level: "error",
                path: path.dirname(require.main.filename) + "/logs/errors.log"  // log ERROR and above to a file
            }
        ],
        serializers: {

        }
    });



    //log.level("error");



// all environments
app.set("port", process.env.PORT || 5000);
app.use(cors());                                     // Enable Cross-Origin Resource Sharing on NodeJS Server
app.use(morgan("dev",{})); 				             // log every request to the console
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// development only
if (app.get("env") === "development") {
    //app.use(errorhandler());
}


// production only
if (app.get("env") === "production") {

}



/*
 * Load configs
 * ======================================================================
 */

//var database = require("./config/database"),
var globalSettings = require("./config/global-settings"),
    mysql = require("mysql"),
    pool = mysql.createPool(globalSettings.database.connection);

app.set("knex", require("knex")(globalSettings.database));
app.set("Promise", require("bluebird"));
app.set("bcrypt", app.get("Promise").promisifyAll(require("bcrypt")));

var appFunction = require("./api/app-function")(app, fs, fastCSV, _u, mysql, globalSettings);


/*
 * Routes
 * - Pass the pool object for connecting db
 * ====================================================================== */


/* Authenticate
 * ====================================================================== */

var expressJwt = require("express-jwt");
var jwt = require("jsonwebtoken");
var publicRouter = express.Router();

// Set the token secret here
app.set("SECRET", "MY_SUPER_SECRET");

app.use("/", publicRouter);
require("./api/auth")(app, publicRouter, jwt, _u, appFunction, globalSettings, pool); // Authenticate routes
require("./api/upload")(app, publicRouter, _u, appFunction, globalSettings, fastCSV, path, fs, log, busboy, express); // Upload routes



/* API
 * ====================================================================== */

var apiRouter = express.Router();

// Restrict all accesses to our API with a token
apiRouter.use(expressJwt({
    secret: app.get("SECRET")
}));

app.use("/api", apiRouter);                                            // APIs routes
require("./api/api")(app, apiRouter, pool, _u, appFunction, globalSettings, email, apn, gcm, fastCSV, path, fs, log);


/*
 * Start app
 * ======================================================================
 */

// Error handler at the very last !!!
//var errorHandler = require("express-error-handler"),
//    handler = errorHandler({
//        handlers: {
//            "404": function err404() {
//                // do some custom thing here...
//            }
//        }
//    });
//
//
//
//app.use(function (err, req, res, next) {
//    console.log(err);
//    next(err);
//});
//
//app.use( errorHandler.httpError(400) );
//app.use( errorHandler({server: server}) );


server.listen(app.get("port"), function () {
    console.log("Express server listening on port " + app.get("port"));
});

//server.close();