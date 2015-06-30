var path = require("path");
var rootFolder = path.dirname(require.main.filename);

module.exports = {
    hostname                        : "http://dev.gumiviet.com:5000",
    rootFolder                      : rootFolder,
    rewardThumbFolder               : "/public/uploads/reward-thumbnail/",
    csvUploadFolder                 : "/public/uploads/csv/",
    tmpFolder                       : "/public/uploads/tmp/",
    MySQLDateFormat                 : "yyyy/MM/dd hh:mm:ss",
    MySQLDateFormatOnlyDate         : "yyyy/MM/dd",
    pagination : {
        rowsPerPage : 10,
        maxPagesPerQuery : 7,
        mobile : {
            maxPagesPerQuery : 1,
            rowsPerPage : 10
        }
    },
    ignoreParameters : [
        "exportCSV",
        "currentPage",
        "orderBy",
        "orderDirection",
        "deviceOS",
        "selectRewardForGame",
        "includeRewardId",
        "isMobileDebug"
    ],
    mailServer : {
        user                        : "pandabamboo90@gmail.com",
        password                    : "okpldljulvyohqrw",
        host                        : "smtp.gmail.com",
        ssl                         : true,
        port                        : 465
    },
    mailSubject                     : "This is test title",
    mailText                        : "Congratulation !!! You have won a reward.",
    mailTemplate                    : "<html><b>Congratulation</b> !!! You have won a reward.</html>",
    errorMessage : {
        connection                  : "Cannot get connection to database.",
        transactionBegin            : "Cannot begin the transaction.",
        transactionRollback         : "Transaction failed. Rolled back.",
        executeSQL                  : "Cannot execute SQL query.",
        sweepstakesDateIncorrect    : "Now is not the time for sweepstakes. Failed to set winner for this reward.",
        sendMail                    : "Mail failed to send.",
        apn                         : "APN message failed to send.",
        gcm                         : "GCM message failed to send.",
        wrongPassword               : "Wrong username or password.",
        newPasswordNotMatch         : "Your new password doesn't match.",
        usernameAndPasswordRequire  : "Nickname and password are both required.",
        userDisabled                : "Your account has been disabled."
    },
    message : {
        insert                      : "Insert successfully.",
        update                      : "Update successfully.",
        registerReward              : "Register reward successfully",
        foundRecords                : function(length){
                                        return "Found " + length + " records."
                                      },
        noRecord                    : "Found 0 records.",
        rewardWinner                : "(" + Date.parse(new Date()).toString("MM/dd") + ") Chuc mung !!! Ban da trung thuong.",
        sendMail                    : "Mail sent successfully.",
        apn                         : "APN message successfully sent.",
        gcm                         : "GCM message successfully sent.",
        passwordUpdate              : "Password updated successfully."
    },
    apn : {
        cert                        : rootFolder + "/cert/APN/cert.p12",
        certProduction              : rootFolder + "/cert/APN/cert-production.p12",
        passphrase                  : "crossword",
        isDevelopment               : true
    },
    gcm : {
        apiToken                    : "AIzaSyD-scGjwa8L1eqkEMwP0uOAJFohDKJVXUY"
    },
    database : {
        client : "mysql",
        connection : {
            host     : "localhost",
            user     : "mysql-user",
            password : "mysql-user",
            database : "crossword"
        }
    }
};