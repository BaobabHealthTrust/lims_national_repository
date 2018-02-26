/*
 * GET home page.
 */
Date.prototype.YYYYMMDDHHMMSS = function () {
    var yyyy = this.getFullYear().toString();
    var MM = pad(this.getMonth() + 1,2);
    var dd = pad(this.getDate(), 2);
    var hh = pad(this.getHours(), 2);
    var mm = pad(this.getMinutes(), 2)
    var ss = pad(this.getSeconds(), 2)

    return yyyy + MM + dd+  hh + mm + ss;
};


function pad(number, length) {

    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}

module.exports = function (router) {

    var moment = require("moment");

    var fs = require('fs');

    var s = require("./../lib/nlims_partner.js");


    var path = require("path");

    var couch = require(path.resolve('public', 'library', 'javascripts', 'couch.js'));

    var url = require('url');

    var configs = fs.readFileSync(path.resolve('config', 'couchdb.json'));

    var locks = require("locks");

    var async = require("async");

    var mutex = {};

    var def_account = require('./../lib/account.js');

    function padZeros(number, positions) {
        var zeros = parseInt(positions) - String(number).length;
        var padded = "";

        for (var i = 0; i < zeros; i++) {
            padded += "0";
        }

        padded += String(number);

        return padded;
    }

    function readRecur(dir, filelist) {

        var files = fs.readdirSync(dir);
        filelist = filelist || [];
        files.forEach(function(file) {
            if (fs.statSync(dir + '/' + file).isDirectory()) {
                filelist = readRecur(dir + '/' + file, filelist);
            }
            else {
                filelist.push(dir + '/' + file);
            }
        });

        return filelist;
    }

    function checkValidations(record){

        if(record['_id']){
            var dir = process.cwd() + "/public/validations";
            filelist = readRecur(dir, []);
        }else{
            filelist = [];
        }

        for(var i = 0; i < filelist.length; i++){
            var split = filelist[i].split("/");
            var valid = require(filelist[i])(record);
            var category = split[split.length - 1].split(".")[0];
            var record_id = (split[split.length - 1].split(".")[0].replace(/\s+/g, '_') + "__" + record['_id']);
            couch.db('lims_repo', 'read',
                {
                    '_id': record_id
                }, function (err, result) {
                    error = {
                        '_id': record_id
                    };

                    if(valid && err){
                        return;
                    }else if(!err){
                        error['_rev'] = result['_rev'];
                    }

                    if(!valid){
                        error["doc_type"] = "error";
                        error["category"] = split[split.length - 1].split(".")[0];
                        error["tracking_number"] = record['_id']
                        error["datetime"] = (new Date()).YYYYMMDDHHMMSS();
                        error["who_updated"] = record['who_updated'] ? record['who_updated'] : {};
                        error["sending_facility"] = record['sending_facility']
                        error["receiving_facility"] = record['receiving_facility'];
                        error["test_types"] = record['test_types'];
                        error["sample_type"] = record['sample_type'];
                    }

                    if(valid && !err){
                        console.log('Updating record status to "Resolved" ');
                        error["status"] = 'Resolved';
                    }else if((typeof(result) != 'undefined' && result["status"] != 'New') || (typeof(result) == 'undefined')){
                        error["status"] = 'New'; //New | Resolved
                    }


                    if(error['status']){
                        if (Object.keys(error).length > 6) {
                            couch.db("lims_repo", 'save',
                                error, function (e, result) {
                                    if (e) {
                                    } else {
                                    }
                                })
                        }
                    }
                });
        }
    }

    function doCreateRecord(json, callback) {

        var personDb = "lims_repo";
       
        extra_fields_checks = {
            "rejection_reason" : "",
            "who_dispatched"   : {
                                    "id_number"    : "",
                                    "first_name"   : "",
                                    "last_name"    : "",
                                    "phone_number" : ""
                                },
            "who_updated"   : {
                "id_number"    : "",
                "first_name"   : "",
                "last_name"    : "",
                "phone_number" : ""
            }
        }

        for(var key in extra_fields_checks){
            if(!json[key]){
                json[key] = extra_fields_checks[key];
            }
        }



        var db = "sites";

        var result = {
            id: null,
            err: true
        };

         if (json._id.trim().length > 0) {

            couch.db(personDb, 'save', json, function (jerror, jbody) {

                result.id = json._id;

                result.err = false;

                callback(result);

            });

            return;

        }

        var site = JSON.parse(configs)["site_code"];

        if (!site) {

            result.err = true;

            callback(null);

            return;

        }

        if (!mutex[site]) {

            mutex[site] = locks.createMutex();

        }

        if (mutex[site].tryLock()) {
           

            var months = {
                0: "1",
                1: "2",
                2: "3",
                3: "4",
                4: "5",
                5: "6",
                6: "7",
                7: "8",
                8: "9",
                9: "A",
                10: "B",
                11: "C"
            };

            var days = {
                1: "1",
                2: "2",
                3: "3",
                4: "4",
                5: "5",
                6: "6",
                7: "7",
                8: "8",
                9: "9",
                10: "A",
                11: "B",
                12: "C",
                13: "D",
                14: "E",
                15: "F",
                16: "G",
                17: "H",
                18: "J",
                19: "K",
                20: "M",
                21: "N",
                22: "P",
                23: "Q",
                24: "R",
                25: "T",
                26: "U",
                27: "V",
                28: "W",
                29: "X",
                30: "Y",
                31: "Z"
            };

            var date = (new Date());

            var formattedDate = date.getFullYear() + padZeros(date.getMonth() + 1, 2) + padZeros(date.getDate(), 2);

            var prefix = "X";

            couch.db(db, 'read', {'_id': site}, function (err, pbody) {

                if (!err) {

                    var offset = (pbody[formattedDate] ? pbody[formattedDate].offset : 1);

                    var id = prefix + site + date.getFullYear().toString().substring(2, 4) + months[date.getMonth()] +
                        days[date.getDate()] + padZeros(offset, 3);

                    if (!pbody[formattedDate]) {

                        pbody[formattedDate] = {
                            offset: 2
                        }

                    }

                    pbody[formattedDate].offset = parseInt(offset) + 1;

                    couch.db(db, 'save', pbody, function (error, body) {
                        json["_id"] = id;

                        couch.db(personDb, 'save', json, function (jerror, jbody) {

                            mutex[site].unlock();

                            result.id = id;

                            result.err = false;

                            callback(result);

                        });

                    });

                } else {

                    var offset = 1;

                    var id = prefix + site + date.getFullYear().toString().substring(2, 4) + months[date.getMonth()] +
                        days[date.getDate()] + padZeros(offset, 3);

                    var params = {
                        "_id": site
                    }

                    params[formattedDate] = {
                        offset: parseInt(offset) + 1
                    }

                    couch.db(db, 'save', params, function (error, body) {

                      

                        json["_id"] = id;

                        couch.db(personDb, 'save', json, function (jerror, jbody) {

                            mutex[site].unlock();

                            result.id = id;

                            result.err = false;

                            callback(result);

                        });

                    });

                }

            });

        } else {

            callback(result);

        }

    }

    function doRead(id, callback, format) {

        if (format == undefined) {

            format = false;

        }

        var site = JSON.parse(configs)["site_code"];

        if (!site) {

            return {};

        }

        var db = "lims_repo";

        couch.db(db, 'read', {'_id': id}, function (err, pbody) {
            console.log(err);
            if (!err) {

                if (format) {

                    var keys = Object.keys(pbody);

                    for (var i = 0; i < keys.length; i++) {

                        if (typeof pbody[keys[i]] == "object") {

                            var childKeys = Object.keys(pbody[keys[i]]);

                            for (var j = 0; j < childKeys.length; j++) {

                                if (childKeys[j].trim().toLowerCase().match(/date/)) {

                                    var parts = pbody[keys[i]][childKeys[j]].trim().match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/);

                                    if (parts) {

                                        var date = moment(parts[1] + "-" + parts[2] + "-" + parts[3] + " " + parts[4] + ":" + parts[5]).format("ddd MMM DD YYYY HH:mm");

                                        pbody[keys[i]][childKeys[j]] = date;

                                    }

                                }

                            }

                        } else {

                            if (keys[i].trim().toLowerCase().match(/date/)) {

                                var parts = pbody[keys[i]].trim().match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/);

                                if (parts) {

                                    var date = moment(parts[1] + "-" + parts[2] + "-" + parts[3] + " " + parts[4] + ":" + parts[5]).format("ddd MMM DD YYYY HH:mm");

                                    pbody[keys[i]] = date;

                                }

                            }

                        }

                    }

                }


                callback(pbody);

            } else {
              
                callback(err);

            }

        });


    }

    function doReadByNPID(id, callback) {

        console.log(id);

        var site = JSON.parse(configs)["site_code"];

        if (!site) {

            return {};

        }

        var db = "lims_repo";

        couch.db(db, 'view', id, function (err, pbody) {
            console.log(err);
            if (!err) {


                callback(pbody);

            } else {

                console.log(err);

                callback({});

            }

        });

    }

    function doUpdate(json, callback) {

        var site = JSON.parse(configs)["site_code"];

        if (!site) {

            return {};

        }

        var db = "lims_repo";

        checkValidations(json);

        couch.db(db, 'save', json, function (error, body) {

            if (!error) {

                callback(true);

            } else {

                callback(false);

            }

        });

    }

    router.route('/')
        .get(function (req, res) {
           

            res.status(200).json({message: "Welcome to the LIMS data repo!"});

        })

    router.route('/create_order')
        .post(function (req, res) {
           
            var params = req.body;

            if (params.data) {

                params = params.data;
            }
          
            doCreateRecord(params, function (result) {


                if (result.id == null) {

                    res.status(200).json({error: true, message: "Configuration file not found!", data: null});

                } else if (result.err) {

                    res.status(200).json({error: true, message: "Process busy, please try again later!", data: null});

                } else {

                    checkValidations(result);

                    res.status(200).json({error: false, message: "Done!", data: result.id});

                }

            });
                

        })


        /**
    *@api {get} /query_order_by_tracking_number/:tracking_number/:token Query Patient Orders 2
    *@apiName Query Patient Orders By Tracking Number
    *@apiGroup Order-APIs
    *@apiParam {String} tracking_number tacking number for order whose orders are needed
    *@apiParam {String} token token in order to access the resource
    *@apiParamExample Example of Request with Parameters
    * /query_order_by_npid/XKCH9101010/XTo397ebdu
    *
    *@apiSuccess {String} status status of the request
    *@apiSuccess {String}  error indicating whether the response is an error or not
    *@apiSuccess {String}  message information regarding authentication
    *@apiSuccess {json}  data where the orders are allocated
    *@apiSuccessExample {json} Successful Response Example
    *{
    *   status :201,  
    *   error: false,
    *   message: 'authenticated',
    *   data: {
    *        
    *                 "_id": "XKCH1288400",
    *                 "_rev": "9-ff6372b4f975c763b07b106cfc749e03",
    *                 "patient": {
    *                       "national_patient_id": "00000",
    *                       "first_name": "f-name",
    *                      "middle_name": "m-name",
    *                       "last_name": " l-name",
    *                       "date_of_birth": "0000",
    *                       "gender": "M",
    *                       "phone_number": "000"
    *                   },
    *                   "sample_type": "Blood",
    *                   "who_order_test": {
    *                       "first_name": "f-name",
    *                       "last_name": "l-name",
    *                       "id_number": "0000",
    *                       "phone_number": "0000"
    *                   },
    *                   "date_drawn": "20160614094212",
    *                   "date_dispatched": "",
    *                   "art_start_date": "",
    *                   "date_received": "20160614094212",
    *                   "sending_facility": "Kamuzu Central Hospital",
    *                   "receiving_facility": "Kamuzu Central Hospital",
    *                   "reason_for_test": "",
    *                   "test_types": [
    *                       "Test Name",
    *                       "Test Name"
    *                   ],
    *                   "status": "specimen-accepted",
    *                   "district": "Lilongwe",
    *                   "priority": "Routine",
    *                   "order_location": "4B",
    *                   "results": {
    *                       "Test Name": {
    *                           "20160514094212": {
    *                               "test_status": "Drawn",
    *                               "remarks": "",
    *                               "datetime_started": "20160514094212",
    *                               "datetime_completed": "",
    *                               "results": {
    *                               }
    *                           },
    *                           "20160514094213": {
    *                               "test_status": "pending",
    *                               "remarks": "",
    *                               "datetime_started": "",
    *                               "datetime_completed": "",
    *                               "who_updated": {
    *                                   "first_name": "f-name",
    *                                   "last_name": "l-name",
    *                                   "ID_number": "00"
    *                           },
    *                           "20160514101736": {
    *                               "test_status": "started",
    *                               "remarks": "",
    *                               "datetime_started": "2016-06-14 10:17:36",
    *                               "datetime_completed": null,
    *                               "who_updated": {
    *                                   "first_name": "f-name",
    *                                   "last_name": "l-name",
    *                                   "ID_number": "00"
    *                               },
    *                               "results": [
    *                               ]
    *                           },
    *                           "20160514101806": {
    *                               "test_status": "completed",
    *                               "remarks": "",
    *                               "datetime_started": "2016-06-14 10:17:36",
    *                               "datetime_completed": "2016-06-14 10:18:06",
    *                               "who_updated": {
    *                                   "first_name": "f-name",
    *                                   "last_name": "l-name",
    *                                   "ID_number": "00"
    *                               },
    *                               "results": {
    *                                   "K": "6.36 mmol/L",
    *                                   "Na": "132.2 mmol/L",
    *                                   "Cl": "98.1 mmol/L"
    *                               }
    *                           }
    *                       },
    *                       "Test Name": {
    *                           "20160514094212": {
    *                               "test_status": "Drawn",
    *                               "remarks": "",
    *                               "datetime_started": "20160514094212",
    *                               "datetime_completed": "",
    *                               "results": {
    *                               }
    *                           },
    *                           "20160514094220": {
    *                               "test_status": "pending",
    *                               "remarks": "",
    *                               "datetime_started": "",
    *                               "datetime_completed": "",
    *                              "who_updated": {
    *                                   "first_name": "f-name",
    *                                   "last_name": "l-name",
    *                                   "ID_number": "000"
    *                               }
    *                           },
    *                          "20160514145459": {
    *                               "test_status": "started",
    *                               "remarks": "",
    *                               "datetime_started": "2016-06-14 14:54:59",
    *                               "datetime_completed": null,
    *                               "who_updated": {
    *                                   "first_name": "f-name",
    *                                   "last_name": "l-name",
    *                                   "ID_number": "000"
    *                               },
    *                               "results": [
    *                               ]
    *                           },
    *                           "20160514145520": {
    *                               "test_status": "completed",
    *                               "remarks": "",
    *                               "datetime_started": "2016-06-14 14:54:59",
    *                               "datetime_completed": "2016-06-14 14:55:20",
    *                               "who_updated": {
    *                                   "first_name": "f-name",
    *                                   "last_name": "l-name",
    *                                   "ID_number": "0000"
    *                               },
    *                               "results": {
    *                                   "Urea": "133.5 mg/dl",
    *                                   "Creatinine": "0"
    *                               }
    *                           }
    *                       }
    *                   },
    *                   "date_time": "20160614094212"            
    *   }   
    *}
    *
    *
    *@apiError (Error 400) tracking_number_missing tracking number for order not provided
    *@apiError (Error 400) token_missing token not provided
    *@apiError (Error 400) token_expired token not provided,re-authenticate for valid token
    *@apiErrorExample {json} Error Responce Example
    *{
    *   status :400,  
    *   error: true,
    *   message: 'tracking number missing',
    *}
    *
    */


    router.route('/query_order_by_tracking_number/:id/:token')
        .get(function (req, res) {
              
            if(!req.params.id){
             
                res.status(200).json({
                    status: 200,
                    error: true,
                    message: 'order tracking number not provided'
                })
            }
            else if (!req.params.token)
            {
                 res.status(200).json({
                    status: 200,
                    error: true,
                    message: 'token not provided'
                })
            }
            else
            {

                    s.authenticate_partner(req.params.token,function(exp){
                        var exp = exp;
                        var nw = (new Date()).getTime();
                        if (exp < nw)
                        {
                            res.status(200).json({
                                    status: 405,
                                    error: true,
                                    message: "token expired"                                    
                            })
                        }else{ 
                                doRead(req.params.id, function (result) {

                                    res.status(200).json(
                                        {   status: 200,
                                            error: false,
                                            message: 'orders retrived',
                                            data: result
                                        });

                                }, true)
                        }
                    });

            }

        })










    router.route('/query_order')
        .get(function (req, res) {

            var url_parts = url.parse(req.url, true);


            var query = url_parts.query;
          

            doRead(query.id, function (result) {

                res.status(200).json(result);

            }, true)

        })











    /**
    *@api {get} /query_order_by_npid/:npid/:token Query Patient Orders 1
    *@apiName Query Patient Orders by NPID
    *@apiGroup Order-APIs
    *@apiParam {String} national_patient_id patient national patient id whose orders are needed
    *@apiParam {String} token token in order to access the resource
    *@apiParamExample Example of Request with Parameters
    * /query_order_by_npid/00007R/XTo397ebdu
    *
    *@apiSuccess {String} status status of the request
    *@apiSuccess {String}  error indicating whether the response is an error or not
    *@apiSuccess {String}  message information regarding authentication
    *@apiSuccess {json}  data where the orders are allocated
    *@apiSuccessExample {json} Successful Response Example
    *{
    *   status :201,  
    *   error: false,
    *   message: 'authenticated',
    *   data: {
    *        [
    *                   "_id": "XKCH1288400",
    *                  "_rev": "9-ff6372b4f975c763b07b106cfc749e03",
    *                 "patient": {
    *                       "national_patient_id": "00000",
    *                       "first_name": "f-name",
    *                      "middle_name": "m-name",
    *                       "last_name": " l-name",
    *                       "date_of_birth": "0000",
    *                       "gender": "M",
    *                       "phone_number": "000"
    *                   },
    *                   "sample_type": "Blood",
    *                   "who_order_test": {
    *                       "first_name": "f-name",
    *                       "last_name": "l-name",
    *                       "id_number": "0000",
    *                       "phone_number": "0000"
    *                   },
    *                   "date_drawn": "20160614094212",
    *                   "date_dispatched": "",
    *                   "art_start_date": "",
    *                   "date_received": "20160614094212",
    *                   "sending_facility": "Kamuzu Central Hospital",
    *                   "receiving_facility": "Kamuzu Central Hospital",
    *                   "reason_for_test": "",
    *                   "test_types": [
    *                       "Test Name",
    *                       "Test Name"
    *                   ],
    *                   "status": "specimen-accepted",
    *                   "district": "Lilongwe",
    *                   "priority": "Routine",
    *                   "order_location": "4B",
    *                   "results": {
    *                       "Test Name": {
    *                           "20160514094212": {
    *                               "test_status": "Drawn",
    *                               "remarks": "",
    *                               "datetime_started": "20160514094212",
    *                               "datetime_completed": "",
    *                               "results": {
    *                               }
    *                           },
    *                           "20160514094213": {
    *                               "test_status": "pending",
    *                               "remarks": "",
    *                               "datetime_started": "",
    *                               "datetime_completed": "",
    *                               "who_updated": {
    *                                   "first_name": "f-name",
    *                                   "last_name": "l-name",
    *                                   "ID_number": "00"
    *                           },
    *                           "20160514101736": {
    *                               "test_status": "started",
    *                               "remarks": "",
    *                               "datetime_started": "2016-06-14 10:17:36",
    *                               "datetime_completed": null,
    *                               "who_updated": {
    *                                   "first_name": "f-name",
    *                                   "last_name": "l-name",
    *                                   "ID_number": "00"
    *                               },
    *                               "results": [
    *                               ]
    *                           },
    *                           "20160514101806": {
    *                               "test_status": "completed",
    *                               "remarks": "",
    *                               "datetime_started": "2016-06-14 10:17:36",
    *                               "datetime_completed": "2016-06-14 10:18:06",
    *                               "who_updated": {
    *                                   "first_name": "f-name",
    *                                   "last_name": "l-name",
    *                                   "ID_number": "00"
    *                               },
    *                               "results": {
    *                                   "K": "6.36 mmol/L",
    *                                   "Na": "132.2 mmol/L",
    *                                   "Cl": "98.1 mmol/L"
    *                               }
    *                           }
    *                       },
    *                       "Test Name": {
    *                           "20160514094212": {
    *                               "test_status": "Drawn",
    *                               "remarks": "",
    *                               "datetime_started": "20160514094212",
    *                               "datetime_completed": "",
    *                               "results": {
    *                               }
    *                           },
    *                           "20160514094220": {
    *                               "test_status": "pending",
    *                               "remarks": "",
    *                               "datetime_started": "",
    *                               "datetime_completed": "",
    *                              "who_updated": {
    *                                   "first_name": "f-name",
    *                                   "last_name": "l-name",
    *                                   "ID_number": "000"
    *                               }
    *                           },
    *                          "20160514145459": {
    *                               "test_status": "started",
    *                               "remarks": "",
    *                               "datetime_started": "2016-06-14 14:54:59",
    *                               "datetime_completed": null,
    *                               "who_updated": {
    *                                   "first_name": "f-name",
    *                                   "last_name": "l-name",
    *                                   "ID_number": "000"
    *                               },
    *                               "results": [
    *                               ]
    *                           },
    *                           "20160514145520": {
    *                               "test_status": "completed",
    *                               "remarks": "",
    *                               "datetime_started": "2016-06-14 14:54:59",
    *                               "datetime_completed": "2016-06-14 14:55:20",
    *                               "who_updated": {
    *                                   "first_name": "f-name",
    *                                   "last_name": "l-name",
    *                                   "ID_number": "0000"
    *                               },
    *                               "results": {
    *                                   "Urea": "133.5 mg/dl",
    *                                   "Creatinine": "0"
    *                               }
    *                           }
    *                       }
    *                   },
    *                   "date_time": "20160614094212"
    *                   ],
    *                   [
    *                        {
    *                           "_id": "XKCH1718234",
    *                           "_rev": "3-8017d4d27975ab1fb617a06ca23cd20d",
    *                           "test_types": [
    *                               "Test Name"
    *                           ],
    *                           "results": {
    *                              "Hepatitis C Test": {
    *                                   "20171106092004": {
    *                                       "test_status": "Drawn",
    *                                       "remarks": "",
    *                                       "datetime_started": "20171106092004",
    *                                       "datetime_completed": "",
    *                                       "results": {
    *                                       }
    *                                   }
    *                               }
    *                           },
    *                           "who_dispatched": {
    *                               "id_number": "000",
    *                               "first_name": "f-name",
    *                               "last_name": "l-name",
    *                               "phone_number": "0000"
    *                           },
    *                           "date_dispatched": "20171106102644",
    *                           "patient": {
    *                               "national_patient_id": "00000",
    *                               "first_name": "f-name",
    *                               "middle_name": " ",
    *                               "last_name": "l-name",
    *                              "date_of_birth": "0000",
    *                               "gender": "F",
    *                               "phone_number": "0000"
    *                           },
    *                           "sample_type": "Blood",
    *                           "who_order_test": {
    *                               "first_name": "f-name",
    *                               "last_name": "l-name",
    *                               "id_number": "0000",
    *                               "phone_number": "00000"
    *                           },
    *                           "date_drawn": "000",
    *                           "art_start_date": "000",
    *                           "date_received": "0000",
    *                           "sending_facility": "Kamuzu Central Hospital",
    *                           "receiving_facility": "KCH",
    *                           "reason_for_test": "Routin",
    *                           "status": "Drawn",
    *                           "district": "Lilongwe",
    *                           "priority": "Routin",
    *                           "order_location": "1A",
    *                           "date_time": "20171106092004",
    *                           "rejection_reason": "",
    *                           "who_updated": {
    *                               "id_number": "000",
    *                               "first_name": "f-name",
    *                               "last_name": "l-name",
    *                               "phone_number": "000"
    *                           }
    *                        }
    *                   ]
    *                
    *   }   
    *}
    *
    *
    *@apiError (Error 400) national_patient_id_missing patient national id not provided
    *@apiError (Error 400) token_missing token not provided
    *@apiError (Error 400) token_expired token not provided,re-authenticate for valid token
    *@apiErrorExample {json} Error Responce Example
    *{
    *   status :400,  
    *   error: true,
    *   message: 'national patient id missing',
    *}
    *
    */



    router.route('/query_order_by_npid/:id/:token')
        .get(function (req, res) {
            
            if(!req.params.id){
             
                res.status(200).json({
                    status: 200,
                    error: true,
                    message: 'patient  national id not provided'
                })
            }
            else if (!req.params.token)
            {
                 res.status(200).json({
                    status: 200,
                    error: true,
                    message: 'token not provided'
                })
            }
            else
            {
                 s.authenticate_partner(req.params.token,function(exp){
                        var exp = exp;
                        var nw = (new Date()).getTime();
                        if (exp < nw)
                        {
                            res.status(200).json({
                                    status: 405,
                                    error: true,
                                    message: "token expired"                                    
                            })
                        }else{ 
                            doReadByNPID(req.params.id, function (result) {

                                res.status(200).json({
                                    status : 200,
                                    error : false,
                                    message: 'order retrived',
                                    data: { order: result}
                                });

                            })
                        }
                });
            }

        })



    router.route('/update_order')
        .post(function (req, res) {
            var params = req.body;    

            if (params.data) {
                params = params.data;
            }
            
                // doing the normal order update, (order status, test results)
                 doRead(params._id, function (result) {


                    if (Object.keys(result).length > 0) 
                       {        var json = result;
                                var keys = [];
                                if (params.results) {
                                    var keys = Object.keys(params.results);
                                }
                              
                                var date = new Date();

                                var update_keys = [
                                    'status', "who_dispatched",
                                     "rejection_reason", "date_dispatched",
                                     "date_drawn"
                                 ];

                                for(var k = 0; k < update_keys.length; k++){
                                    if(params[update_keys[k]]){
                                        json[update_keys[k]] = params[update_keys[k]];
                                    }
                                }

                                var timestamp = date.YYYYMMDDHHMMSS();
                                for (var i = 0; i < keys.length; i++) {
                                    if (json.test_types.indexOf(keys[i]) < 0) {
                                        json.test_types.push(keys[i]);
                                        json.results[keys[i]] = {};
                                    }
                                    if (!json.results[keys[i]]){
                                        json.results[keys[i]] = {}
                                    }
                                    json.results[keys[i]][timestamp] = params.results[keys[i]];
                                }
                                doUpdate(json, function (success) {
                                    if (success) {
                                        res.status(200).json({status: "SUCCESS"});
                                    } else {
                                        res.status(200).json({status: "FAILED"});
                                    }
                                })
                       } 
                    else {

                    res.status(200).json({status: "FAILED"});
                    }
            })
          
          
        })

    router.route('/lab_order')
        .get(function (req, res) {

            var facilities = JSON.parse(fs.readFileSync(path.resolve('config', 'facilities.json'))).sort();

            var districts = JSON.parse(fs.readFileSync(path.resolve('config', 'districts.json'))).sort();

            var url_parts = url.parse(req.url, true);

            var query = url_parts.query;

            var sample_types = ['DBS (Using capillary tube)', 'DBS (Free drop to DBS card)', 'Plasma', 'Whole Blood',
                'Sputum', 'Pus'];

            var reasons_for_testing = ["Routine", "Targeted (Treatment Failure Suspected)", "Other", "Redraw",
                "Confirmatory (Follow up test after high viral load))"];

            // res.removeHeader('X-Frame-Options');

            res.render('lab_order', {
                first_name: (query.first_name || ""),
                last_name: (query.last_name || ""),
                middle_name: (query.middle_name || ""),
                gender: (query.gender || ""),
                date_of_birth: (query.date_of_birth || ""),
                national_patient_id: (query.national_patient_id || ""),
                return_path: (query.return_path || ""),
                sample_types: sample_types,
                district: (query.district || ""),
                health_facility_name: (query.health_facility_name || ""),
                date_sample_drawn: (query.date_sample_drawn || ""),
                phone_number: (query.phone_number || ""),
                reason_for_test: (query.reason_for_test || ""),
                sample_collector_last_name: (query.sample_collector_last_name || ""),
                sample_collector_first_name: (query.sample_collector_first_name || ""),
                sample_collector_phone_number: (query.sample_collector_phone_number || ""),
                sample_collector_id: (query.sample_collector_id || ""),
                sample_order_location: (query.sample_order_location || ""),
                sample_priority: (query.sample_priority || ""),
                sample_type: (query.sample_type || ""),
                hide_demographics: (query.hide_demographics.toString().toLowerCase() == "true" ? true : false),
                info: (query.return_path ? "" : "Missing return path. Can't proceed!"),
                art_start_date: (query.art_start_date || ""),
                date_received: (query.date_received || ""),
                date_dispatched: (query.date_dispatched || ""),
                facilities: facilities,
                districts: districts,
                reasons_for_testing: reasons_for_testing,
                health_facility_name: (query.health_facility_name || ""),
                target_lab: (query.target_lab || ""),
                localCreateURL: (query.localCreateURL || ""),
                ts: ((query.ts || "").trim().toLowerCase() == "true" ? true : false)
            });

        })



    router.route('/sample_tests/:id')
        .get(function (req, res) {

            var sample_types = {
                "whole blood": ['FBC', 'WBC', 'VL', 'RBC'],
                'dbs (using capillary tube)': ['Viral Load'],
                'dbs (free drop to dbs card)': ['Viral Load'],
                'plasma': ['Viral Load'],
                'sputum': ['TB Test'],
                'pus': ['Other']
            };

            res.status(200).json(sample_types[req.params.id.trim().toLowerCase()]);

        })



    /**
    *@api {post} /create_nlims_account Create Account
    *@apiName Create Account
    *@apiGroup Account-APIs
    *@apiParam {String} partner name of partner to be consuming api service
    *@apiParam {String} app_name name of application to be accessing the api service
    *@apiParam {String} location partner location
    *@apiParam {String} password password set for the account to be used for re-aunthentication when token expires
    *@apiParam {String} username username set for the account to be used for re-aunthentication when token expires
    *@apiParam {String} token token given when authenticated
    *@apiParamExample Example of Request with Parameters
    * {
    *   partner  : 'baobab health trust',
    *   app_name : 'iblis',
    *   location : 'lilongwe',  
    *   username : 'aaaa',
    *   password : 'xxxx',
    *   token    : 'XQWTDPK29900'
    * }
    *@apiSuccess {String} status status of the request
    *@apiSuccess {String}  error indicating whether the response is an error or not
    *@apiSuccess {String}  message information regarding account creation
    *@apiSuccess {json}  data where token is allocated, to be used for accessing the api resources when is valid
    *@apiSuccessExample {json} Successful Response Example
    *{
    *   status :201,  
    *   error: false,
    *   message: 'account created',
    *   data: {
    *       token: "XaTB939478P2"
    *   }   
    *}
    *
    *
    *@apiError (Error 400) username_missing username is not provided
    *@apiError (Error 400) password_missing password is not provided
    *@apiError (Error 400) location is not provided
    *@apiError (Error 400) partner partner name is not provided
    *@apiError (Error 400) app_nam application name is not provided
    *@apiError (Error 400) token token is not provided
    *@apiError (Error 400) account_already_exist account already exist
    *@apiError (Error 400) token_expired token expired,re-authenticate for valid token
    *@apiErrorExample {json} Error Responce Example
    *{
    *   status :400,  
    *   error: true,
    *   message: 'account already exist',
    *}
    *
    */


    router.route('/create_nlims_account').post(function(req,res){
        
        var data = req.body;
        var err_msg = null;
        if (!data)
        {

        }else if(!data.location)
        {
            err_msg = "location not specified";
        }
        else if (!data.partner)
        {
            err_msg = "partner name not provided";
        }
        else if (!data.app_name)
        {
            err_msg = "application name not provided";
        }
        else if (!data.password)
        {
            err_msg = "password not provided";
        }
        else if(!data.username)
        {
            err_msg = "username not provided";
        }
        else if(!data.token)
        {
            err_msg = "token not provided";
        }
        else
        {            
            var token = data['token'];
            var checker = false;
            var got_da;
            var va = null;
            fs.readFile('./lib/tmp_tokens.txt','utf8',function(er, contents){
                var da = contents.split("_");

                da.forEach(function(el){
                    var got_to = el.substring(0,12);
                    var got_exp = el.substring(12,26);
                    var tim = (new Date()).getTime();

                    if (got_to == token && got_exp > tim)
                    {   
                        
                        checker = true;
                        s.create_account(data['partner'],data['app_name'],data['location'],data['password'],data['username'], function(err,re){
                            if (err == false)
                            {   da.splice(da.indexOf(el),1);   
                                    res.status(200).json({
                                            "status": 200,
                                            "message": "account created",
                                            "error": false,
                                            "data": {
                                                token: re
                                            }
                                    });
                            }
                            else
                            {
                                    res.status(200).json({
                                                "status": 400,
                                                "message": "account already exist",
                                                "error": true,
                                        });
                            }
                            
                        });  

                    }
                  
                })
     
                if (checker == false)
                {
                    res.status(200).json({
                                    "status": 400,
                                    "message": "token expired",
                                    "error": true,
                                    "description": "",
                                    "data": { }
                            });
                }
                else{

                    da.forEach(function(a){
                        if (a){
                            va += (a +"_");
                        }
                    })

                    fs.writeFile('./lib/tmp_tokens.txt', va, function (err) {
                        if (err) throw err;
                        console.log('created successfuly gud gud');
                    });
                }
               
            }) 
        }

        if (err_msg)
        {
                res.status(200).json({
                        "status": 400,
                        "message": err_msg,
                        "error": true,
                    });
        }                 

    })









    /**
    *@api {get} /authenticate/:username/:password Authenticate for new Account
    *@apiName Authenticate
    *@apiGroup Account-APIs
    *@apiParam {String} username default username for the api service
    *@apiParam {String} password default password for the api service
    *@apiParamExample Example of Request with Parameters
    * /authenticate/ooooo/xxxxxx
    *@apiSuccess {String} status status of the request
    *@apiSuccess {String}  error indicating whether the response is an error or not
    *@apiSuccess {String}  message information regarding authentication
    *@apiSuccess {json}  data where token is allocated, to be used for account creation
    *@apiSuccessExample {json} Successful Response Example
    *{
    *   status :201,  
    *   error: false,
    *   message: 'authenticated',
    *   data: {
    *       token: "XaTB939478P2"
    *   }   
    *}
    *
    *
    *@apiError (Error 400) username_missing username to get access to account creation not provided
    *@apiError (Error 400) password_missing password to get access to account creation not provided
    *@apiError (Error 400) not_authenticated have no access to the account creation
    *@apiErrorExample {json} Error Responce Example
    *{
    *   status :400,  
    *   error: true,
    *   message: 'not authenticated',
    *}
    *
    */



    router.route('/authenticate/:username/:password').get(function(req,res){

        var username = req.params.username;
        var password = req.params.password;
        var msg = null;

        if (!username)
        {
            msg = "username missing";
            var response ={
                        status: "405",
                        error: "true",
                        message: "username missing"
                    }

                    res.status(200).json(response);
        }
        else if (!password)
        {
            msg = "password missing";
            var response ={
                        status: "405",
                        error: "true",
                        message: "password missing"
                    }

                    res.status(200).json(response);
        }
        else{
          
            def_account.get_default_account_details(function(data){
                password = def_account.decrypt(password,data['salt']);
                if (password == data['password'] && username == data['username'])
                {
                    
                    var token =  def_account.generate_tmp_token();
                    
                    var response ={
                        status: "201",
                        error: "false",
                        message: "authenticated",
                        data: {
                                token: token
                               }
                    }

                    res.status(200).json(response);
                }
                else
                {
             
                    var response ={
                        status: "405",
                        error: "true",
                        message: "not authenticated"
                    }

                    res.status(200).json(response);
                }

            })

           
        }
        

    })





/**
*@api {get} /check_token_validity/:token Check Token Validity
*@apiName Check Token Validity
*@apiGroup Account-APIs
*@apiParam {String} token token to be checked
*@apiParamExample Example of Request with Parameters
* /check_token_validity/gihwkDTE8vTV
*@apiSuccess {String} status status of the request
*@apiSuccess {String}  error indicating whether the response is an error or not
*@apiSuccess {String}  message information regarding validity of token
*@apiSuccessExample {json} Successful Response Example
*{
* status :200,  
* error: false,
* message: 'token valid'
*}
*
*
*
*@apiError (Error 400) token_missing token used to access the resource is not provided
*@apiError (Error 400) token_expired token used to access the resoruce is expired
*@apiErrorExample {json} Error Responce Example
*{
* status :400,  
* error: true,
* message: 'token expired'   
*}
*
*/

    router.route('/check_token_validity/:token').get(function(req,res){
        var token = req.params.token;

        if (req.params.token){
            s.authenticate_partner(token,function(exp){
                var exp = exp;
                var nw = (new Date()).getTime();
                if (exp < nw)
                {
                    res.status(200).json({
                            status: "405",
                            error: "true",
                            message: "token expired",
                            
                    })
                }
                else
                {
                    res.status(200).json({
                            status: "200",
                            error: "false",
                            message: "token valid",
                            
                    })
                }
                
            });
        }else
        {
            res.status(200).json({
                            status: "405",
                            error: true,
                            message: "token is not provided"             
            })
        }

    })




























/**
*@api {post} /create_hl7_order Create Order
*@apiName Create hl7 Order 
*@apiGroup Order-APIs
*@apiParam {String} first_name first name of patient to whom order belongs
*@apiParam {String} last_name  last name of patient to whom order belongs
*@apiParam {String} middle_name middle name of patient to whom order belongs
*@apiParam {String} phone_number phone number of patient to whom order belongs
*@apiParam {String} date_of_birth date of birth of patient to whom order belongs
*@apiParam {String} gender gender of patient to whom order belongs
*@apiParam {String} national_patient_id national patient id of patient to whom order belongs
*@apiParam {String} sample_collector_last_name first name of person collecting the order's sample
*@apiParam {String} sample_collector_first_name last name of person collecting the order's sample
*@apiParam {String} sample_collector_phone_number phone number of person collecting the order's sample
*@apiParam {String} sample_collector_id id of person collecting the order's sample
*@apiParam {String} sample_order_location location at which the order is placed (like ward)
*@apiParam {String} date_sample_drawn date at which sample was drawn
*@apiParam {String} [art_start_date] art start date of patient if patient is enrolled in art program
*@apiParam {String} [date_received] date at which the sample was received
*@apiParam {String} health_facility_name facility name at which the order is ordered
*@apiParam {String} sample_priority priority level of the sample
*@apiParam {String} tests tests ordered from the sample
*@apiParam {String} district district of the health facility at which the order is placed
*@apiParam {String} target_lab the lab at which the sample is to be analysed                     
*@apiParam {String} reason_for_test 
*@apiParam {String} token token in order to access this resource
*@apiParam {String} return_json specifying if want response in json (true/false)
*@apiParamExample Example of Request with Parameters 
* {
*          "district": "lilongwe",
*          "health_facility_name": "Kawale Health Centre",
*          "first_name": "f-name",
*          "last_name": "l-name",
*          "middle_name": "m-name",
*          "date_of_birth": "00000000",
*          "gender": "m",
*          "national_patient_id": "00007R",
*          "requesting_clinician": "John Doe",
*          "sample_type": "Blood",
*          "tests": ['Renal Function Test', 'Viral Load', 'FBC'],
*          "date_sample_drawn": "0000000",
*          "sample_priority": "routine",
*          "target_lab": "Kamuzu Central Hospital",       
*          "sample_collector_last_name": "f-name",
*          "sample_collector_first_name": "l-name",
*          "sample_collector_phone_number": "00000",
*          "sample_collector_id": "10015",
*          "sample_order_location": "OPD",
*          "reason_for_test": "",
*          "art_start_date": "00000",
*          "date_received":  "00000000",             
*          "return_json": 'true'   
* }
*
*@apiSuccess {String} status status of the request
*@apiSuccess {String}  error indicating whether the response is an error or not
*@apiSuccess {String}  message information regarding the response
*@apiSuccess {json} data where tracking number of the order is located
*@apiSuccessExample {json} Successful Responce Example
*{
* status :200,  
* error: false,
* message: 'order created successfuly',
* data: {
*       tracking_number: XJDKE99090    
*   }
*}
*
*@apiError (Error 400) token_expired token used to access the resoruce is expired
*@apiError (Error 400) district_missing district not provided
*@apiError (Error 400) health_facility_name health facility not provided
*@apiError (Error 400) first_name first patient first name not provided
*@apiError (Error 400) last_name last patient last name not provided
*@apiError (Error 400) phone_number patient phone number not provided
*@apiError (Error 400) gender patient patient gender not provided
*@apiError (Error 400) national_patient_id patient national id not provided
*@apiError (Error 400) sample_type order sample type not provided
*@apiError (Error 400) tests order order tests not provided
*@apiError (Error 400) date_drawn date sample drawn not provided
*@apiError (Error 400) sample_priority sample priority not provided 
*@apiError (Error 400) target_lab target lab not provided
*@apiError (Error 400) date_drawn date sample drawn not provided
*@apiError (Error 400) sample_order_location location for sample ordering not provided
*@apiError (Error 400) sample_collector_first_name first name for sample collector not provided
*@apiError (Error 400) sample_collector_last_name last name for sample collector not 
*@apiError (Error 400) token token for resource accessing not provided 
*
*
*
*@apiErrorExample {json} Error Responce Example
*{
* status :400,  
* error: true,
* message: 'token missing'   
*}
*
*/


    router.route('/create_hl7_order')
        .post(function (req, res) {

            var params = req.body;
            var msg = null;

            if (params.data) {

                params = params.data;
                
            }


            if (params)
            {

                if (params['token'])
                {
                 
                    s.authenticate_partner(params['token'],function(exp){
                        var exp = exp;
                        var nw = (new Date()).getTime();
                        if (exp < nw)
                        {
                            res.status(200).json({
                                    status: "405",
                                    error: "true",
                                    message: "token expired",
                                    
                            })
                        }
                        else
                        {
                                if(!params.district)
                                {
                                    msg = "district not provided";
                                }
                                else if(!params['health_facility_name'])
                                {
                                    msg = "district not provided";
                                }
                                else if(!params['first_name'])
                                {
                                    msg = "patient first name not provided";
                                }
                                 else if(!params['last_name'])
                                {
                                    msg = "patient last name not provided";
                                }
                                else if(!params['phone_number'])
                                {
                                    msg = "patient phone number nont provided";
                                }
                                 else if(!params['gender'])
                                {
                                    msg = "patient gender not provided"
                                }
                                 else if(!params['national_patient_id'])
                                {
                                    msg = "patient ID not provided";
                                }
                                else if(!params['sample_type'])
                                {
                                    msg = "sample type not provided";
                                }
                                else if(!params['tests'])
                                {
                                    msg = "tests not provided";
                                }
                                else if(!params['date_drawn'])
                                {
                                    msg = "date for sample drawn not provided";
                                }
                                 else if(!params['sample_priority'])
                                {
                                    msg = "sample priority level not provided";
                                }
                                 else if(!params['target_lab'])
                                {
                                    msg = "target lab for sample not provided";
                                }
                                 else if(!params['sample_order_location'])
                                {
                                    msg = "sample order location not provided";
                                }
                                else if(!params['sample_collector_first_name'])
                                {
                                    msg = "first name for person ordering not provided";
                                }
                                 else if(!params['sample_collector_last_name'])
                                {
                                    msg = "last name for person ordering not provided";
                                }
                                else{
                                    console.log("yes yes yes ");
                                            var template = "MSH|^~&||^^||^^|||OML^O21^OML_O21||T|2.5\r" +
                                                "PID|1||~^^^^^^||^^|||||||||||||\r" +
                                                "ORC||||||||||^^^|||^^^^^^^^||||||||^^^^^^^|^^^^^^^\r" +
                                                "TQ1|1||||||||^^^\r" +
                                                "SPM|1|||^\r";
                                            /*+
                                             "OBR|1|||^^||||||||||||^^^\r" +
                                             "NTE|1|P|\r";*/
                                        
                                            var hl7e = require("hl7");

                                            var hl7 = hl7e.parseString(template);

                                            var date = (new Date());

                                            hl7[0][4][0][0] = (params.health_facility_name || "");

                                            hl7[0][6][0][0] = (params.target_lab || "");

                                            hl7[0][7][0][0] = date.YYYYMMDDHHMMSS();

                                            hl7[0][10][0][0] = date.YYYYMMDDHHMMSS();

                                            // hl7[1][3][0][0] = (params.national_patient_id || "");

                                            hl7[1][5][0][0] = (params.last_name || "");

                                            hl7[1][5][0][1] = (params.first_name || "");

                                            hl7[1][5][0][2] = (params.middle_name || "");

                                            hl7[1][13][0][0] = (params.phone_number || "");

                                            if (params.date_of_birth) {

                                                var dob = (new Date(params.date_of_birth));

                                                var formattedDob = dob.YYYYMMDDHHMMSS();

                                                hl7[1][7][0][0] = (formattedDob || "");

                                            }

                                            hl7[1][8][0][0] = (params.gender || "");

                                            hl7[1][3][0][0] = (params.national_patient_id || "");

                                            hl7[4][2][0][0] = (params.tracking_number || "");

                                            hl7[2][21][0][0] = (params.health_facility_name || "");

                                            hl7[2][10][0][0] = (params.sample_collector_id || "");

                                            hl7[2][10][0][1] = (params.sample_collector_last_name || "");

                                            hl7[2][10][0][2] = (params.sample_collector_first_name || "");

                                            hl7[2][14][0][0] = (params.sample_collector_phone_number || "");

                                            hl7[2][22][0][2] = ((params.district && params.district.length > 0) ? params.district : JSON.parse(configs)["district"]);

                                            hl7[2][13][0][1] = (params.sample_order_location || "");

                                            var timestamp = moment(new Date()).format("YYYYMMDDHHmmss");

                                            hl7[2][9][0][0] = timestamp;

                                            // hl7[3][9][0][1] = (params.sample_priority || "");

                                            hl7[4][4][0][1] = (params.sample_type || "");

                                            console.log("am here");
                                            for (var i = 0; i < params.tests.length; i++) {

                                                hl7.push([
                                                    'OBR',
                                                    [
                                                        [ (i + 1).toString() ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '',
                                                            '',
                                                            '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '',
                                                            '',
                                                            '',
                                                            '']
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ],
                                                    [
                                                        [ 'F' ]
                                                    ],
                                                    [
                                                        [ ' ' ]
                                                    ] ]);

                                                hl7.push([ 'NTE',
                                                    [
                                                        [ (i + 1).toString() ]
                                                    ],
                                                    [
                                                        [ 'P' ]
                                                    ],
                                                    [
                                                        [ '' ]
                                                    ] ]);

                                                hl7[5 + (2 * i)][4][0][1] = (params.tests[i].replace(/\&/g, "ampersand") || "");

                                                var today = (new Date());

                                                var dateDrawn = ((new Date(params.date_sample_drawn)) || (new Date()));

                                                var dateDrawnFormatted = dateDrawn.YYYYMMDDHHMMSS();

                                                hl7[5 + (2 * i)][7][0][0] = (!isNaN(dateDrawn.getFullYear()) ? dateDrawnFormatted : "");

                                                var artStartDate = ((new Date(params.art_start_date)) || (new Date()));

                                                var artStartDateFormatted = artStartDate.YYYYMMDDHHMMSS();

                                                hl7[5 + (2 * i)][6][0][0] = (!isNaN(artStartDate.getFullYear()) ? artStartDateFormatted : "");

                                                var dateReceived = ((new Date(params.date_received)) || (new Date()));

                                                var dateReceivedFormatted = dateReceived.YYYYMMDDHHMMSS();

                                                hl7[5 + (2 * i)][14][0][0] = (!isNaN(dateReceived.getFullYear()) ? dateReceivedFormatted : "");

                                                var dateDispatched = ((new Date(params.date_dispatched)) || (new Date()));

                                                var dateDispatchedFormatted = dateDispatched.YYYYMMDDHHMMSS();

                                                hl7[5 + (2 * i)][8][0][0] = (!isNaN(dateDispatched.getFullYear()) ? dateDispatchedFormatted : "");

                                                hl7[5 + (2 * i)][5][0][0] = (params.sample_priority || "");

                                                hl7[5 + (2 * i)][13][0][0] = (params.reason_for_test || "");

                                                hl7[5 + (2 * i)][16][0][0] = (params.sample_collector_id || "");

                                                hl7[5 + (2 * i)][16][0][1] = (params.sample_collector_last_name || "");

                                                hl7[5 + (2 * i)][16][0][2] = (params.sample_collector_first_name || "");

                                                hl7[5 + (2 * i)][16][0][3] = (params.sample_collector_phone_number || "");

                                                hl7[6 + (2 * i)][3][0][0] = (params.status || "Drawn");

                                            }
                                            

                                            var hl7Str = hl7e.serializeJSON(hl7);
                                           
                                            var mirth = JSON.parse(configs);

                                            var options_auth = {user: mirth.mirth_username, password: mirth.mirth_password};

                                            var Client = require('node-rest-client').Client;

                                            var args = {
                                                data: hl7Str,
                                                headers: {"Content-Type": "text/plain"}
                                            };


                                            var trackingNumberExists = false;

                                            if (params.tracking_number && params.tracking_number.trim().length > 0) {

                                                trackingNumberExists = true;

                                            }           
                                            

                                            (new Client()).put(mirth.mirth_host, args, function (data, response) {
                                                console.log(response);
                                                console.log("--------------------------------");
                                                var output = data.toString();
                                                console.log(output);               
                                                var resultHL7 = hl7e.parseString(output);
                                               
                                                var tracking_number = resultHL7[4][2][0][0];

                                                params.tracking_number = tracking_number;

                                                var localCreateURL = params.localCreateURL;

                                                var link = params.return_path + "?";

                                                var keys = Object.keys(params);

                                                for (var i = 0; i < keys.length; i++) {

                                                    var key = keys[i];

                                                    if (key == "return_path") continue;

                                                    link += (link.trim().match(/\?$/) ? "" : "&") + key + "=" + encodeURI(params[key]);

                                                }

                                                if (params.return_json == 'true') {

                                                    res.status(200).json({
                                                            status: 200,
                                                            error: false,
                                                            data: params.tracking_number
                                                        });

                                                } else {

                                                    if (!trackingNumberExists) {

                                                        var json = {
                                                            "_id": params.tracking_number,
                                                            "accession_number": params.accession_number,
                                                            "patient": {
                                                                "national_patient_id": params.national_patient_id,
                                                                "first_name": params.first_name,
                                                                "middle_name": params.middle_name,
                                                                "last_name": params.last_name,
                                                                "date_of_birth": params.date_of_birth,
                                                                "gender": params.gender,
                                                                "phone_number": params.phone_number
                                                            },
                                                            "sample_type": params.sample_type,
                                                            "who_order_test": {
                                                                "first_name": params.sample_collector_first_name,
                                                                "last_name": params.sample_collector_last_name,
                                                                "id_number": params.sample_collector_id,
                                                                "phone_number": params.sample_collector_phone_number
                                                            },
                                                            "date_drawn": params.date_sample_drawn,
                                                            "date_dispatched": params.date_dispatched,
                                                            "art_start_date": params.art_start_date,
                                                            "date_received": params.date_received,
                                                            "sending_facility": params.health_facility_name,
                                                            "receiving_facility": params.target_lab,
                                                            "reason_for_test": params.reason_for_test,
                                                            "test_types": params.tests,
                                                            "status": (params.status || "Drawn"),
                                                            "district": params.district,
                                                            "priority": params.sample_priority,
                                                            "order_location": params.sample_order_location,
                                                            "results": {
                                                            },
                                                            "date_time": (params.date_time || "")
                                                        };

                                                        res.render("print", {id: params.tracking_number, path: link, params: JSON.stringify(json),
                                                            localCreateURL: localCreateURL});

                                                    } else {

                                                        res.redirect(link);

                                                    }

                                                }

                                            });
                                        
                                }  
                                
                                if (msg)
                                {
                                    res.status(200).json({
                                                    status: "405",
                                                    error: "true",
                                                    message: msg,
                                                        
                                    })
                                }
                        }
                        
                    });                    


                }
                else{

                     res.status(200).json({
                                        status: "405",
                                        error: "true",
                                        message: "token not provided",
                                        data: { }          
                                    })

                }


               
            }
            else
            {
                res.status(200).json({
                        status: "405",
                        error: "true",
                        message: "order not submited",
                        data: {
                               
                               }
                })
            }
     

        });          












    router.route('/print/:id')
        .get(function (req, res) {

            doRead(req.params.id, function (result) {

                console.log(JSON.stringify(result));
                var label = "\n\N\nR215,0\nZT\n";

                label += 'A6,6,0,2,1,1,N,"' + (result.patient.last_name || "") + ', ' +
                    (result.patient.first_name || "") + ' ' + ((result.patient.middle_name || "").trim().length > 3 ?
                    (result.patient.middle_name || "").substring(0, 1) + '.' : (result.patient.middle_name || "")) + '"\n';

                var age = "?";

                if ((result.patient.date_of_birth || "").length > 0) {

                    var dob = parseInt(result.patient.date_of_birth.substring(0, 4));

                    console.log(result.patient.date_of_birth);

                    age = ((new Date()).getFullYear() - dob);

                    if (age <= 0) {
                        age = "<1";
                    }
                }

                label += 'A6,29,0,2,1,1,N,"' + (result.patient.national_patient_id || "") + '        ' +
                    ((result.patient.date_of_birth || "").length > 0 ?
                        (moment(result.patient.date_of_birth).format("DD-MMM-YYYY")) : "???") + ' ' + age + 'y ' +
                    (result.patient.gender || "") + '"\n';

                label += 'B51,51,0,1A,2,2,76,N,"' + result._id + '"\n';

                label += 'A51,131,0,2,1,1,N,"' + (result.accession_number || "") + ' * ' + result._id + '"\n';

                var dateDrawn = (result.date_drawn || "").match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/);

                label += 'A6,150,0,2,1,1,N,"Col: ' + (dateDrawn ?
                    (moment(dateDrawn[1] + "-" + dateDrawn[2] + "-" + dateDrawn[3] + " " + dateDrawn[4] + ":" +
                        dateDrawn[5]).format("DD-MMM-YYYY HH:mm")) : "???") + ' by ' +
                    (result.who_order_test.first_name || "").substring(0, 1) + "." +
                    (result.who_order_test.last_name || "").substring(0, 1) + "." + '"\n';

                label += 'A6,172,0,2,1,1,N,"' + (result.test_types || []).join(",") + '"\n';

                if (result.priority.toString().toLowerCase().trim().match(/^stat/)) {

                    label += 'A24,6,1,2,1,1,R,"   STAT   "\n';

                }

                label += 'P1\n';

                res.setHeader('Content-Length', label.length);

                var name = (new Date()).getTime();

                res.setHeader('Content-disposition', 'attachment; filename=' + name + '.lbl');

                res.setHeader('Content-type', 'text/plain');

                res.send(label);

                res.end();

                res.status(200).json(label);

            })

        });










    router.route('/print')
        .get(function (req, res) {

            var url_parts = url.parse(req.url, true);

            var query = url_parts.query;

            res.render("print", {id: query.id, path: query.path, params: query.params});

        });











/**
*@api {get} /query_results/:tracking_number/:token Query Order Results
*@apiName Query Order Results
*@apiGroup Order-APIs
*@apiParam {String} tracking_number order tracking number
*@apiParam {String} token token in order to access the resource
*@apiParamExample Example of Request with Parameters 
* /query_results/XQCH178E371/gihwkDTE8vTV
*@apiSuccess {String} status status of the request
*@apiSuccess {String}  error indicating whether the response is an error or not
*@apiSuccess {String}  message information regarding the response
*@apiSuccess {json} data order results
*@apiSuccessExample {json} Successful Response Example
*{
* status :200,  
* error: false,
* message: 'results retrived successfuly',
* data: 
*   {
*     {
*      "Test Name": {
*       "20170714090806": {
*          "test_status": "Drawn",
*           "remarks": "",
*           "datetime_started": "20170714090806",
*           "datetime_completed": "",
*           "results": {
*           }
*       },
*       "20170814120201": {
*           "test_status": "started",
*           "remarks": "",
*           "datetime_started": "2017-08-14 12:02:00",
*           "datetime_completed": null,
*           "who_updated": {
*               "first_name": "f-name",
*               "last_name": "l-name",
*               "ID_number": "000"
*           },
*           "results": [
*           ]
*       },
*       "20170814120211": {
*           "test_status": "completed",
*           "remarks": "",
*           "datetime_started": "2017-08-14 12:02:00",
*           "datetime_completed": "2017-08-14 12:02:08",
*           "who_updated": {
*               "first_name": "f-name",
*               "last_name": "l-name",
*               "ID_number": "000"
*           },
*           "results": {
*               "GPT/ALT": "29.46 U/L",
*               "GOT/AST": "60.02 U/L",
*               "Alkaline Phosphate(ALP)": "151.80 U/L",
*               "GGT/r-GT": "414.79 U/L",
*               "Bilirubin Direct(DBIL-DSA)": "0.34 mg/dl",
*               "Bilirubin Total(TBIL-DSA))": "0.38 mg/dl",
*               "Albumin(ALB)": "2.52 mg/dl",
*               "Protein(TP)": "7.08 mg/dl",
*               "LDH": "538.65 U/L"
*           }
*       },
*       "20170814150632": {
*           "test_status": "verified",
*           "remarks": "",
*           "datetime_started": "2017-08-14 12:02:00",
*           "datetime_completed": "2017-08-14 12:02:08",
*           "who_updated": {
*               "first_name": "f-name",
*               "last_name": "l-name",
*               "ID_number": "000"
*           },
*           "results": {
*               "GPT/ALT": "29.46 U/L",
*               "GOT/AST": "60.02 U/L",
*               "Alkaline Phosphate(ALP)": "151.80 U/L",
*               "GGT/r-GT": "414.79 U/L",
*               "Bilirubin Direct(DBIL-DSA)": "0.34 mg/dl",
*               "Bilirubin Total(TBIL-DSA))": "0.38 mg/dl",
*               "Albumin(ALB)": "2.52 mg/dl",
*               "Protein(TP)": "7.08 mg/dl",
*               "LDH": "538.65 U/L"
*           }
*       }
*   },
*   "Test Name": {
*       "20170714090806": {
*           "test_status": "Drawn",
*           "remarks": "",
*           "datetime_started": "20170714090806",
*           "datetime_completed": "",
*           "results": {
*           }
*       },
*       "20170814120215": {
*           "test_status": "started",
*           "remarks": "",
*           "datetime_started": "2017-08-14 12:02:14",
*           "datetime_completed": null,
*           "who_updated": {
*               "first_name": "f-name",
*               "last_name": "l-name",
*               "ID_number": "000"
*           },
*           "results": [
*           ]
*       },
*       "20170814150621": {
*           "test_status": "completed",
*           "remarks": "",
*           "datetime_started": "2017-08-14 12:02:14",
*           "datetime_completed": "2017-08-14 12:02:29",
*           "who_updated": {
*               "first_name": "f-name",
*               "last_name": "l-name",
*               "ID_number": "000"
*           },
*           "results": {
*               "Urea": "297.93 mg/dl",
*               "Creatinine": "",
*               "CREA-J": "13.24 mg/dl"
*           }
*       },
*       "20170814150632": {
*           "test_status": "verified",
*           "remarks": "",
*           "datetime_started": "2017-08-14 12:02:14",
*           "datetime_completed": "2017-08-14 12:02:29",
*           "who_updated": {
*               "first_name": "f-name",
*               "last_name": "l-name",
*               "ID_number": "000"
*           },
*           "results": {
*               "Urea": "297.93 mg/dl",
*               "Creatinine": "",
*               "CREA-J": "13.24 mg/dl"
*           }
*       }
*   }
*}
*   }
*}
*
*
*@apiError (Error 400) token_missing token used to access the resource is not provided
*@apiError (Error 400) token_expired token used to access the resoruce is expired
*@apiError (Error 400) tracking_number_missing tracking number for the order whose results are needed in not provided
*@apiError (Error 400) order_not_available order with such tracking number is unavailable
*@apiErrorExample {json} Error Responce Example
*{
* status :400,  
* error: true,
* message: 'token missing'   
*}
*
*
*
*
*
*
*
*
*
*/








    router.route('/query_results/:id/:token')
        .get(function (req, res) {

          
            if (!req.params.token)
            {
                res.status(401).json({
                    status: 401,
                    error: true,
                    message: "token is missing"
                }); 
            }
            else{

                if (!req.params.id)
                {
                    res.status(401).json({
                        status: 401,
                        error: true,
                        message: "order's tracking number is missing"
                    });
                }else {

                    s.authenticate_partner(req.params.token,function(exp){
                        var exp = exp;
                        var nw = (new Date()).getTime();
                        if (exp < nw)
                        {
                            res.status(200).json({
                                    status: 405,
                                    error: true,
                                    message: "token expired"                                    
                            })
                        }else{                   

                            doRead(req.params.id, function (result) {

                                if (!result.test_types) {

                                    res.status(200).json({
                                            status: 405,
                                            error: true,
                                            message: "no order with such tracking number"
                                    });
                                    return;
                                }

                                var results = {};

                                for (var i = 0; i < result.test_types.length; i++) {

                                    if (!result.results[result.test_types[i]]) {
                                        continue;
                                    }
                                    var timestamps = Object.keys(result.results[result.test_types[i]]).sort();

                                    results[result.test_types[i]] = {};

                                    results[result.test_types[i]][timestamps[timestamps.length - 1]] = result.results[result.test_types[i]][timestamps[timestamps.length - 1]]

                                }

                                console.log(JSON.stringify(results));

                                // Overwrite the rest of the results with our selected set only
                                result.results = results;
                                res.status(200).json({
                                    status: 201,
                                    error: false,
                                    message: 'results retrived successfuly',
                                    data: result.results
                                });

                            }, true)
                        }
                    });
                }
            }            

        });


/*--------------------------------------end--------------------------------------------*/




    return router;
}

/*exports.index = function(req, res){
 res.render('index', { title: 'Express' })
 };*/