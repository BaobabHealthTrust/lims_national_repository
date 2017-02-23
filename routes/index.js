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

var crypto = require('crypto');


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

    var path = require("path");

    var couch = require(path.resolve('public', 'library', 'javascripts', 'couch.js'));

    var url = require('url');

    var configs = fs.readFileSync(path.resolve('config', 'couchdb.json'));

    var locks = require("locks");

    var mutex = {};

    function padZeros(number, positions) {
        var zeros = parseInt(positions) - String(number).length;
        var padded = "";

        for (var i = 0; i < zeros; i++) {
            padded += "0";
        }

        padded += String(number);

        return padded;
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

            console.log("busy!");

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


                pbody['patient']['first_name'] = decrypt(pbody['patient']['first_name']);
                pbody['patient']['middle_name'] = decrypt(pbody['patient']['middle_name']);
                pbody['patient']['last_name'] = decrypt(pbody['patient']['last_name']);

                pbody['who_order_test']['first_name'] =  decrypt(pbody['who_order_test']['first_name']);
                pbody['who_order_test']['last_name'] =   decrypt(pbody['who_order_test']['last_name']);
                pbody['who_order_test']['phone_number'] =  decrypt(pbody['who_order_test']['phone_number']);
           
                callback(pbody);

            } else {

                callback({});

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

            if (!err) {


                callback(pbody);

            } else {

                console.log(err);

                callback({});

            }

        });

    }

    function doUpdate(json, callback) {

        console.log(json);

        var site = JSON.parse(configs)["site_code"];

        if (!site) {

            return {};

        }
        //encrypting dispatcher details
        json['who_dispatched']['id_number'] =  encrypt(json['who_dispatched']['id_number'].toString());
        json['who_dispatched']['first_name'] =  encrypt(json['who_dispatched']['first_name']);
        json['who_dispatched']['last_name'] =  encrypt(json['who_dispatched']['last_name']);
        json['who_dispatched']['phone_number'] =  encrypt(json['who_dispatched']['phone_number']);



        var db = "lims_repo";

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
          
            //encrypting patients details
            if (params['patient'] && typeof(params['patient']) == 'object'){
                params['patient']['first_name'] =  encrypt(params['patient']['first_name']);
                params['patient']['middle_name'] =  encrypt(params['patient']['middle_name']);
                params['patient']['last_name'] =  encrypt(params['patient']['last_name']);
                params['patient']['date_of_birth'] =  encrypt(params['patient']['date_of_birth']);
                params['patient']['phone_number'] =  encrypt(params['patient']['phone_number']);
            }

            //encrypting who order details
            if (params['who_order_test'] && typeof(params['who_order_test']) == 'object'){
                params['who_order_test']['first_name'] =  encrypt(params['who_order_test']['first_name']);
                params['who_order_test']['last_name'] =  encrypt(params['who_order_test']['last_name']);
                params['who_order_test']['phone_number'] =  encrypt(params['who_order_test']['phone_number']);
           
            }

            doCreateRecord(params, function (result) {

                if (result.id == null) {

                    res.status(200).json({error: true, message: "Configuration file not found!", data: null});

                } else if (result.err) {

                    res.status(200).json({error: true, message: "Process busy, please try again later!", data: null});

                } else {

                    res.status(200).json({error: false, message: "Done!", data: result.id});

                }

            });
                

        })

    router.route('/query_order/:id')
        .get(function (req, res) {

            doRead(req.params.id, function (result) {

                res.status(200).json(result);

            }, true)

        })

    router.route('/query_order')
        .get(function (req, res) {

            var url_parts = url.parse(req.url, true);

            var query = url_parts.query;

            doRead(query.id, function (result) {

                res.status(200).json(result);

            }, true)

        })

    router.route('/query_order_by_npid/:id')
        .get(function (req, res) {

            doReadByNPID(req.params.id, function (result) {

                res.status(200).json(result);

            })

        })

    router.route('/update_order')
        .post(function (req, res) {
            var params = req.body;    

            //return res.status(200).json(params);
            if (params.data) {
                params = params.data;
            }
           
           console.log(params);

                // doing the normal order updation, (order status, test results)
                 doRead(params._id, function (result) {

                    if (Object.keys(result).length > 0) 
                       {        var json = result;
                                var keys = [];
                                if (params.results) {
                                    var keys = Object.keys(params.results);
                                }
                                console.log(keys);
                                var date = new Date();

                                var update_keys = [
                                    'sample_status', "who_dispatched",
                                     "rejection_reason", "date_dispatched"
                                 ];

                                for(var k = 0; k < update_keys.length; k++){
                                    if(params[update_keys[k]]){
                                        json[update_keys[k]] = params[update_keys[k]];
                                    }
                                }
                                /*
                                if (params.sample_status) {
                                    json.status = params.sample_status;
                                 
                                }
                                if(params[.who_dispatched]){
                                    json.who_dispatched = params['who_dispatched'];
                                }
                                if(params.rejection_reason){
                                    json.rejection_reason = params['rejection_reason'];
                                }
                                */
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

    router.route('/create_hl7_order')
        .post(function (req, res) {

            var params = req.body;

            if (params.data) {

                params = params.data;

            }

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

                var output = data.toString();


               
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

                    res.status(200).json(params);

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

            })

        });


    router.route('/print')
        .get(function (req, res) {

            var url_parts = url.parse(req.url, true);

            var query = url_parts.query;

            res.render("print", {id: query.id, path: query.path, params: query.params});

        });

    router.route('/query_results/:id')
        .get(function (req, res) {

            doRead(req.params.id, function (result) {

                if (!result.test_types) {

                    console.log(result);

                    res.status(200).json({});

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

                res.status(200).json(result);

            }, true)

        })

    return router;




    function encrypt(text){
      var crypto = require('crypto');
      var algorithm = 'aes-256-ctr';
      var password ='d6F3Efeq';
      var cipher = crypto.createCipher(algorithm,password);
      var crypted = cipher.update(text,'utf8','hex');
      crypted += cipher.final('hex');
      return crypted;
    }


    function decrypt(text){
      var crypto = require('crypto');
      var algorithm = 'aes-256-ctr', password ='d6F3Efeq';
      var decipher = crypto.createDecipher(algorithm,password)
      var dec = decipher.update(text,'hex','utf8')
      dec += decipher.final('utf8');
      return dec;
    }





}

/*exports.index = function(req, res){
 res.render('index', { title: 'Express' })
 };*/