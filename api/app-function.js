module.exports = function(app, fs, fastCSV, _u, mysql, globalSettings){
    var Promise = app.get("Promise")

    this.buildSQLSearchQuery = function(reqObj){
        var sqlWhere = "",
            whereParams = [];


        //Loop through the parameters and build the SQL search query
        _u.each(reqObj, function (v, k) {
            if (k.indexOf("_id") != -1) {
                sqlWhere += k + " = ? and ";
            } else if (k.indexOf("is_premium") != -1 || k.indexOf("is_reward_delivered") != -1) {
                if (v != "2"){
                    sqlWhere += k + " = ? and ";
                } else {
                    sqlWhere += k + " < ? and ";
                }
            } else if (k.indexOf("_from") != -1) {
                sqlWhere += k.replace("_from", "") + " >= ? and ";
            } else if (k.indexOf("_to") != -1) {
                sqlWhere += k.replace("_to", "") + " <= ? and ";
            } else {
                sqlWhere += k + " like ? and ";
                reqObj[k] = "%" + reqObj[k] + "%";
            }
            whereParams.push(reqObj[k]);
        });

        sqlWhere += "1 = 1 ";

        //console.log(sqlWhere)

        return {
            sqlWhere : sqlWhere,
            whereParams : whereParams
        };
    };

    this.convertRequestDataToUnderscore = function(reqObj){
        var cloneObj = {};

        _u.each(_u.keys(_u.omit(reqObj, globalSettings.ignoreParameters)), function(v){
            var keyName = this.camelCaseToUnderscore(v).toLowerCase();
            cloneObj[keyName] = reqObj[v];
        });

        return cloneObj
    };


    this.getFullDateTime = function(){
        var date = new Date(),
            year = date.getFullYear().toString(),
            month = (date.getMonth() + 1).toString(),
            day = date.getDate().toString(),
            hours = date.getHours().toString(),
            minutes = date.getMinutes().toString(),
            seconds = date.getSeconds().toString();

        if(month < 10)
            month = "0" + month;
        if(day < 10)
            day = "0" + day;
        if(hours < 10)
            hours = "0" + hours;
        if(minutes < 10)
            minutes = "0" + minutes;
        if(seconds < 10)
            seconds = "0" + seconds;

        return year + month + day + hours + minutes + seconds;
    };

    this.exportCSV = function(csvData, dataType, callback){
        var filename = dataType + "_" + this.getFullDateTime() + ".csv",
            writePath = globalSettings.rootFolder + globalSettings.tmpFolder + filename,
            filePath = globalSettings.hostname + globalSettings.tmpFolder + filename;

        fastCSV.writeToPath(writePath, csvData, {
            headers: true
        }).on("finish", function(){
            callback(filePath);
        });
    };

    this.readCSV = function(csvFilePath){
        fastCSV
            .fromPath(csvFilePath)
            .on("record", function(data){
                console.log(data);
            })
            .on("end", function(){
                console.log("done");
            });
    };

    this.underscoreToCamelCase = function(input) {
        return input.replace(/_(.)/g, function(match, group1) {
            return group1.toUpperCase();
        });
    };

    this.camelCaseToUnderscore = function(str) {
        return str.replace(/\W+/g, '_')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2');
    };

    this.camelCaseToDash = function(str){
        return str.replace(/\W+/g, '-')
            .replace(/([a-z\d])([A-Z])/g, '$1-$2');
    };


    this.compactObject = function(o) {
        var clone = _u.clone(o);
        _u.each(clone, function(v, k) {
            if(!v) {
                delete clone[k];
            }
        });
        return clone;
    };


    this.isEmptyThenNull = function(o){
        var clone = _u.clone(o);

        _u.each(clone, function(v, k){
            if(_u.isEmpty(v))
                clone[k] = null;
        });
        return clone;
    };


    this.prepareUpdateDateQuery = function(updateFields, deviceType){
        var result = "";

        _u.each(updateFields, function(value, key){
            if(_u.isEmpty(value)){
                value = null;
                result += key + " = " + mysql.escape(value) + ", ";
            }else{
                if(deviceType == "mobile"){
                    result += key + " = '" + value + "', "; // Add a " " after time value for correct SQL query
                }else{
                    result += key + " = concat(" + mysql.escape(value) + ", ' ', case when time(" + key + ") is null then '' else time(" + key + ") end), "; // Add a " " after time value for correct SQL query
                }
            }
        });

        return result = result.substring(0, result.lastIndexOf(",")); // Remove the last comma
    };


    this.generatePagesArray = function(currentPage, totalRowCount, maxPagesPerQuery, rowsPerPage){
        var currentPage = parseInt(currentPage),
            maxPagesPerQuery = maxPagesPerQuery ? maxPagesPerQuery : globalSettings.pagination.maxPagesPerQuery ,
            minPageNumber = 1,
            maxPageNumber = 7,
            pageGroup = Math.ceil(currentPage / maxPagesPerQuery),
            rowsPerPage = rowsPerPage ? rowsPerPage : globalSettings.pagination.rowsPerPage,
            pageArrays = [],
            maxRowsPerQuery = maxPagesPerQuery * rowsPerPage,
            endPageNumber = Math.ceil(totalRowCount / rowsPerPage);

        if(currentPage <= maxPagesPerQuery){
            minPageNumber = 1;
        }else{
            minPageNumber = (maxPagesPerQuery * pageGroup) - maxPagesPerQuery + 1;
        }

        if(totalRowCount <= maxRowsPerQuery){
            maxPageNumber = Math.ceil(totalRowCount / rowsPerPage);
        }else{
            maxPageNumber = maxPagesPerQuery * pageGroup;

            if(maxPageNumber > endPageNumber)
                maxPageNumber = endPageNumber
        }

        for(var i = minPageNumber; i <= maxPageNumber ; i++){
            pageArrays.push(i);
        }

        return {
            currentPage : currentPage,
            minPageNumber : minPageNumber,
            maxPageNumber : maxPageNumber,
            startPageNumber : 1,
            endPageNumber : endPageNumber,
            pageGroup : pageGroup,
            pageArrays : pageArrays,
            indexPageArray : _u.indexOf(pageArrays,currentPage),
            maxRowsPerQuery : maxRowsPerQuery,
            rowsPerPage : rowsPerPage,
            startRow : (pageGroup - 1) * maxRowsPerQuery,
            maxPagesPerQuery : maxPagesPerQuery,
            total : totalRowCount
        };
    };

    this.convertQueryResultData = function(data){
        var result = [];

        _u.each(data, function(v, k){
            var resultObj = {};

            _u.each(v, function(vv, kk){
                var keyName = this.underscoreToCamelCase(kk);
                resultObj[keyName] = vv;
            });

            result.push(resultObj);
        });

        return result
    };

    this.addCountDownTimer = function(result, field){
        if(!field){
            console.log("No field to add count down");
            return
        }
        var now = (new Date).getTime();

        _u.each(result.data, function(row){
            row.countDownTimer = Date.parse(row[field]).getTime() - now;
            if(row.countDownTimer <= 0) row.countDownTimer = 0;
        });
    };

    return this
};