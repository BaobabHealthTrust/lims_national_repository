/*
 * GET home page.
 */

module.exports = function (router) {

    var fs = require('fs');

    var path = require("path");

    var couch = require(path.resolve('public', 'javascripts', 'couch.js'));

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

        console.log(json);

        var site = JSON.parse(configs)["site_code"];

        if (!site) {

            return null;

        }

        if (!mutex[site]) {

            mutex[site] = locks.createMutex();

        }

        var result = {
            id: null,
            err: true
        };

        if (mutex[site].tryLock()) {

            console.log("locked mutex");

            var personDb = "lims_repo";

            var db = "sites";

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

            couch.db(db, 'read', {'_id': site}, function (err, pbody) {

                if (!err) {

                    var offset = (pbody[formattedDate] ? pbody[formattedDate].offset : 1);

                    var id = site + date.getFullYear().toString().substring(2, 4) + months[date.getMonth()] +
                        days[date.getDate()] + padZeros(offset, 3);

                    if (!pbody[formattedDate]) {

                        pbody[formattedDate] = {
                            offset: 2
                        }

                    }

                    pbody[formattedDate].offset = parseInt(offset) + 1;

                    couch.db(db, 'save', pbody, function (error, body) {

                        console.log(id);

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

                    var id = site + date.getFullYear().toString().substring(2, 4) + months[date.getMonth()] +
                        days[date.getDate()] + padZeros(offset, 3);

                    var params = {
                        "_id": site
                    }

                    params[formattedDate] = {
                        offset: parseInt(offset) + 1
                    }

                    couch.db(db, 'save', params, function (error, body) {

                        console.log(id);

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

    function doRead(id, callback) {

        console.log(id);

        var site = JSON.parse(configs)["site_code"];

        if (!site) {

            return {};

        }

        var db = "lims_repo";

        couch.db(db, 'read', {'_id': id}, function (err, pbody) {

            if (!err) {

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

                res.status(200).json({data: result});

            })

        })

    router.route('/query_order')
        .get(function (req, res) {

            var url_parts = url.parse(req.url, true);

            var query = url_parts.query;

            doRead(query.id, function (result) {

                res.status(200).json({data: result});

            })

        })

    router.route('/query_order_by_npid/:id')
        .get(function (req, res) {

            doReadByNPID(req.params.id, function (result) {

                res.status(200).json({data: result});

            })

        })

    router.route('/update_order')
        .post(function (req, res) {

            var params = req.body;

            if (params.data) {

                params = params.data;

            }

            doRead(params._id, function (result) {

                if (Object.keys(result).length > 0) {

                    var json = params;

                    json._id = result._id;

                    json._rev = result._rev;

                    doUpdate(json, function (success) {

                        if (success) {

                            res.status(200).json({status: "SUCCESS", data: json});

                        } else {

                            res.status(200).json({status: "FAILED", data: json});

                        }

                    })

                } else {

                    res.status(200).json({status: "FAILED", data: params});

                }

            })

        })

    router.route('/lab_order')
        .get(function (req, res) {

            var url_parts = url.parse(req.url, true);

            var query = url_parts.query;

            var sample_types = ['Dry Blood Spot', 'Whole Blood', 'Sputum', 'Pus'];

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
                info: (query.return_path ? "" : "Missing return path. Can't proceed!")
            });

        })

    router.route('/sample_tests/:id')
        .get(function (req, res) {

            var sample_types = {
                "whole blood": ['FBC', 'WBC', 'VL', 'RBC']
            };

            res.status(200).json(sample_types[req.params.id.replace(/\+/g, " ").toLowerCase()]);

        })


    router.route('/create_hl7_order')
        .post(function (req, res) {

            var params = req.body;

            if (params.data) {

                params = params.data;

            }

            console.log(params);

            var template = "MSH|^~&||^^||^^|||OML^O21^OML_O21||T|2.5\r" +
                "PID|1||~^^^^^^||^^|||\r" +
                "ORC||||||||||^^^|||^^^^^^^^||||||||^^^|\r" +
                "TQ1|1||||||||^^^\r" +
                "SPM|1|||^\r"; /*+
                "OBR|1|||^^||||||||||||^^\r" +
                "NTE|1|P|\r";*/

            var hl7e = require("hl7");

            var hl7 = hl7e.parseString(template);

            var date = (new Date());

            hl7[0][4][0][0] = (params.health_facility_name || "");

            hl7[0][6][0][0] = (params.target_lab || "");

            hl7[0][7][0][0] = date.getFullYear() + (padZeros(date.getMonth() + 1, 2)) + padZeros(date.getDate(), 2) +
                padZeros(date.getHours()) + padZeros(date.getMinutes(), 2) + padZeros(date.getSeconds(), 2);

            hl7[0][10][0][0] = date.getFullYear() + (padZeros(date.getMonth() + 1, 2)) + padZeros(date.getDate(), 2) +
                padZeros(date.getHours()) + padZeros(date.getMinutes(), 2) + padZeros(date.getSeconds(), 2);

            // hl7[1][3][0][0] = (params.national_patient_id || "");

            hl7[1][5][0][0] = (params.last_name || "");

            hl7[1][5][0][1] = (params.first_name || "");

            hl7[1][5][0][2] = (params.middle_name || "");

            if(params.date_of_birth) {

                var dob = (new Date(params.date_of_birth));

                var formattedDob = dob.getFullYear() + (padZeros(dob.getMonth() + 1, 2)) + padZeros(dob.getDate(), 2) +
                    padZeros(dob.getHours()) + padZeros(dob.getMinutes(), 2) + padZeros(dob.getSeconds(), 2);

                hl7[1][7][0][0] = (formattedDob || "");

            }

            hl7[1][8][0][0] = (params.gender || "");

            hl7[1][3][1][0] = (params.national_patient_id || "");

            hl7[4][4][0][1] = (params.tests || "");

            hl7[2][21][0][0] = (params.health_facility_name || "");

            hl7[2][10][0][0] = (params.sample_collector_id || "");

            hl7[2][10][0][1] = (params.sample_collector_last_name || "");

            hl7[2][10][0][2] = (params.sample_collector_first_name || "");

            hl7[2][10][0][3] = (params.sample_collector_phone_number || "");

            hl7[3][9][0][1] = (params.sample_priority || "");

            hl7[4][4][0][1] = (params.sample_type || "");

            for(var i = 0; i < params.tests.length; i++) {

                hl7.push([
                        'OBR',
                        [ [ (i + 1).toString() ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '',
                            '',
                            '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '',
                            '',
                            '',
                            ''] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ '' ] ],
                        [ [ 'F' ] ],
                        [ [ ' ' ] ] ]);

                hl7.push([ 'NTE',
                    [ [ (i + 1).toString() ] ],
                    [ [ 'P' ] ],
                    [ [ '' ] ] ]);

                hl7[5 + (2 * i)][4][0][1] = (params.tests[i] || "");

                var today = (new Date());

                var dateDrawn = ((new Date(params.date_sample_drawn)) || (new Date()));

                var dateDrawnFormatted = dateDrawn.getFullYear() + (padZeros(dateDrawn.getMonth() + 1, 2)) + padZeros(dateDrawn.getDate(), 2) +
                    padZeros(today.getHours()) + padZeros(today.getMinutes(), 2) + padZeros(today.getSeconds(), 2);

                hl7[5 + (2 * i)][7][0][0] = (dateDrawnFormatted || "");

                hl7[5 + (2 * i)][13][0][0] = (params.reason_for_test || "");

                hl7[5 + (2 * i)][16][0][0] = (params.sample_collector_id || "");

                hl7[5 + (2 * i)][16][0][1] = (params.sample_collector_last_name || "");

                hl7[5 + (2 * i)][16][0][2] = (params.sample_collector_first_name || "");

                hl7[5 + (2 * i)][16][0][3] = (params.sample_collector_phone_number || "");

                hl7[6 + (2 * i)][3][0][0] = "Drawn";

            }

            var hl7Str = hl7e.serializeJSON(hl7);

            console.log(hl7Str.replace(/\r/g, "\n"));

            var mirth = JSON.parse(configs);

            var options_auth = {user: mirth.mirth_username, password: mirth.mirth_password};

            var Client = require('node-rest-client').Client;

            var args = {
                data: hl7Str,
                headers: {"Content-Type": "text/plain"}
            };

            (new Client()).put(mirth.mirth_host, args, function (data, response) {

                var output = data.toString();

                var resultHL7 = hl7e.parseString(output);

                console.log(hl7e.serializeJSON(resultHL7).replace(/\r/g,'\n'));

                var accession_number = resultHL7[5][2][0][0];

                params.accession_number = accession_number;

                var link = params.return_path + "?";

                var keys = Object.keys(params);

                for(var i = 0; i < keys.length; i++) {

                    var key = keys[i];

                    if(key == "return_path") continue;

                    link += (link.trim().match(/\?$/) ? "" : "&") + key + "=" + encodeURI(params[key]);

                }

                console.log(link);

                res.redirect(link);

            });

        });

    return router;

}

/*exports.index = function(req, res){
 res.render('index', { title: 'Express' })
 };*/