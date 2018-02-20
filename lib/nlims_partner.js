"use strict"

var fs = require('fs');
var path = require("path");
var client = require('node-rest-client').Client;
var couch = require(path.resolve('public', 'library', 'javascripts', 'couch.js'));
var configs = fs.readFileSync(path.resolve('config', 'couchdb.json'));


var couch_protocol = JSON.parse(configs)['protocol'];
var couch_site_code = JSON.parse(configs)['site_code'];
var couch_host =  JSON.parse(configs)['host'];
var couch_username = JSON.parse(configs)['username'];
var couch_password = JSON.parse(configs)['password'];
var couch_port = JSON.parse(configs)['port'];

exports.create_account = function create_account(partner,app_name,contact_details,origin,password,username,token,salt)
{
	console.log(couch_host);
	 var args = {
            "data": {
                "_id": "username1",
                "username": "username",
                "salt": "salt",
                "application": app_name,
                "site_code": couch_site_code,
                "password": "passcode",
                "type": "User1",
                "token": token,
                "contact_details": contact_details,
                "origin": origin,
                "partner": partner
            },
            headers: {"Content-Type": "application/json"}
        };


	(new client()).post(couch_protocol + "://" + couch_host + ":" + couch_port + "/" + "lims_users_repo",args, function(data)
	{

	});

}
