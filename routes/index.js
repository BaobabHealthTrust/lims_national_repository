
/*
 * GET home page.
 */

module.exports = function (router) {

    var fs = require('fs');

    var couch = require('../public/javascripts/couch.js');

    var url = require('url');

    var configs = fs.readFileSync("./config/couchdb.json");

    var locks = require("locks");

    var mutex = {};

    function padZeros(number, positions){
        var zeros = parseInt(positions) - String(number).length;
        var padded = "";

        for(var i = 0; i < zeros; i++){
            padded += "0";
        }

        padded += String(number);

        return padded;
    }

    function doCreateRecord(json, callback){

        console.log(json);

        var site = JSON.parse(configs)["site_code"];

        if(!site) {

            return null;

        }

        if(!mutex[site]) {

            mutex[site] = locks.createMutex();

        }

        var result = {
            id: null,
            err: true
        };

        if(mutex[site].tryLock()) {

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

            couch.db(db, 'read', {'_id': site}, function (err, pbody) {

                if (!err) {

                    var offset = pbody.offset;

                    var id = site + date.getFullYear().toString().substring(2,4) + months[date.getMonth()] +
                        days[date.getDate()] + padZeros(offset, 3);

                    pbody.offset = parseInt(offset) + 1;

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

                    var id = site + date.getFullYear().toString().substring(2,4) + months[date.getMonth()] +
                        days[date.getDate()] + padZeros(offset, 3);

                    var params = {
                        "_id": site,
                        "offset": parseInt(offset) + 1
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

        if(!site) {

            return {};

        }

        var db = "lims_repo";

        couch.db(db, 'read', {'_id': id}, function (err, pbody) {

            if(!err) {

                callback(pbody);

            } else {

                callback({});

            }

        });

    }

    function doUpdate(json, callback) {

        console.log(json);

        var site = JSON.parse(configs)["site_code"];

        if(!site) {

            return {};

        }

        var db = "lims_repo";

        couch.db(db, 'save', json, function (error, body) {

            if(!error) {

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

            doCreateRecord(req.body, function(result) {

                if(result.id == null) {

                    res.status(200).json({error: true, message: "Configuration file not found!", data: null});

                } else if(result.err) {

                    res.status(200).json({error: true, message: "Process busy, please try again later!", data: null});

                } else {

                    res.status(200).json({error: false, message: "Done!", data: result.id});

                }

            });

        })

    router.route('/query_order/:id')
        .get(function (req, res) {

            doRead(req.params.id, function(result) {

                res.status(200).json({data: result});

            })

        })

    router.route('/query_order')
        .get(function (req, res) {

            var url_parts = url.parse(req.url, true);

            var query = url_parts.query;

            doRead(query.id, function(result) {

                res.status(200).json({data: result});

            })

        })

    router.route('/update_order')
        .post(function (req, res) {

            doRead(req.body._id, function(result) {

                if(Object.keys(result).length > 0) {

                    var json = req.body;

                    json._id = result._id;

                    json._rev = result._rev;

                    doUpdate(json, function(success) {

                        if(success) {

                            res.status(200).json({status: "SUCCESS"});

                        } else {

                            res.status(200).json({status: "FAILED"});

                        }

                    })

                } else {

                    res.status(200).json({status: "FAILED"});

                }

            })

        })

    return router;

}

/*exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};*/