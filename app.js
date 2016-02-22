var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var portfinder = require('portfinder');
var cors = require('cors');

var path = require("path");

var router = express.Router();

var couch = require(path.resolve('public', 'library', 'javascripts', 'couch.js'));

var fs = require("fs");
var md5 = require('md5');

// for forms
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('views', path.resolve('views'));
app.set('view engine', 'jade');
app.use(express.static(path.resolve('public')));

app.use(cors());

app.set('view options', {
    layout: true
});

function encrypt(password, salt) {

    var encrypted = md5(password + salt);

    return encrypted;

}

// Routes

// app.use('/', require("./routes/index.js")(router));

app.use('/', require(path.resolve('routes','index.js'))(router));

portfinder.basePort = 3014;

process.env.APPLICATION = "lims-repo";

if(process.env.BHT_MODULE) {

    module.exports = router;

} else {

    if(false) {

        portfinder.getPort(function (err, port) {

            app.listen(port, function () {
                console.log("✔ LIMS REPO server listening on port %d in %s mode", port, app.get('env'));
            });

        });

    } else {

        var port = portfinder.basePort;

        app.listen(port, function () {
            console.log("✔ LIMS REPO server listening on port %d in %s mode", port, app.get('env'));
        });

    }

}
