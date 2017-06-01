/**
 * Created by chimwemwe on 7/24/15.
 */

var fs = require('fs');

var path = require("path");

var configs = fs.readFileSync(path.resolve('config','couchdb.json'));

var json = JSON.parse(configs);

var protocol = json.protocol;

var host = json.host;

var port = json.port;

var username = json.username;

var password = json.password;

var nano = require('nano')(protocol + "://" + username + ":" + password + "@" + host + ":" + port);

if (Array.prototype.includes == null) Array.prototype.includes = function (term) {

    var found = false;

    for (var i = 0; i < this.length; i++) {

        if (this[i] == term) {

            found = true;

            break;

        }

    }

    return found;

}

var CouchDB = function () {

    var parent = this;

    function prepareDB(db, method, params, callback) {

        nano.db.get(db, function (err, body) {

            if (err) {

                nano.db.create(db, function (err, body) {

                    if (err) {

                        console.log('connection failed to initialize');

                        if (callback != undefined) {

                            callback(err);

                        }

                    } else {

                        // console.log('database ' + db + ' created!');

                        loadViews(db, function () {

                            if (method != undefined) {

                                if (params != undefined) {

                                    if (callback != undefined) {

                                        parent[method](db, params, callback);

                                    } else {

                                        parent[method](db, params);

                                    }

                                } else {

                                    if (callback != undefined) {

                                        parent[method](db, callback);

                                    } else {

                                        parent[method](db);

                                    }

                                }

                            }

                        });

                    }

                });

            } else {

                // console.log(body);

                if (method != undefined) {

                    if (params != undefined) {

                        if (callback != undefined) {

                            parent[method](db, params, callback);

                        } else {

                            parent[method](db, params);

                        }

                    } else {

                        if (callback != undefined) {

                            parent[method](db, callback);

                        } else {

                            parent[method](db);

                        }

                    }

                }

            }

        });

    }

    function save(db, params, callback) {

        var couch = nano.use(db);

        couch.insert(params, params._id, function (err, body) {

            if (!err) {

                callback(undefined, body);

            } else {

                if (callback != undefined) {

                    callback(err);

                }

            }

        });

    }

    function read(db, params, callback) {

        var couch = nano.use(db);

        couch.get(params._id, {revs_info: false}, function (err, body) {

            if (!err) {

                callback(err, body);

            } else {

                console.log(err);

                if (callback != undefined) {

                    callback(err);

                }

            }

        });

    }

    function destroy(db, params, callback) {

        var couch = nano.use(db);

        couch.destroy(params._id, params._rev, function (err, body) {

            if (!err) {

                callback(undefined, body);

            } else {

                console.log(err);

                if (callback != undefined) {

                    callback(err);

                }

            }

        });

    }

    function dbExists(db, callback) {

        nano.db.list(function (err, body) {

            // body is an array
            var result = body.includes(db);

            callback(err, result);

            /*body.forEach(function(db) {
             console.log(db);
             });*/
        });

    }

    function docExists(db, params, callback) {

        var couch = nano.use(db);

        couch.list(undefined, function (err, body) {

            var array = [];

            body.rows.forEach(function (doc) {

                array.push(doc.key);

            });

            var result = array.includes(params._id);

            callback(err, result);

        });

    }

    function list(db, callback) {

        var couch = nano.use(db);

        couch.list(undefined, function (err, body) {

            var array = [];

            body.rows.forEach(function (doc) {

                array.push(doc.key);

            });

            callback(err, array);

        });

    }

    function view(db, id, callback) {

        var couch = nano.use(db);

        couch.view('people', 'by_npid', id, function (err, body) {

            var results = {
                "national_patient_id": id,
                "results":[]
            };

            if (!err) {

                body.rows.forEach(function (doc) {

                    results.results = results.results.concat(doc.value);

                });

            } else {

                console.log(err.message);

            }

            callback(err, results);

        });

    }

    this.save = save;

    this.read = read;

    this.view = view;

    this.destroy = destroy;

    this.dbExists = dbExists;

    this.docExists = docExists;

    this.list = list;

    this.db = prepareDB;

}

module.exports = new CouchDB;
