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


var nano = require('nano')(couch_protocol + "://" + couch_username + ":" + couch_password + "@" +couch_host + ":" + couch_port);


exports.create_account = function create_account(partner,app_name,contact_details,origin,password,username)
{
	var res_data;
	 var args = {
            "data": {
                "_id": partner,
                "username": "username",
                "salt": "salt",
                "application": app_name,
                "site_code": couch_site_code,
                "password": "passcode",
                "type": "User12",
                "token": "token",
                "contact_details": contact_details,
                "origin": origin,
                "partner": partner,
                "voided": false
            },
            headers: {"Content-Type": "application/json"}
        };


	(new client()).post(couch_protocol + "://" + couch_host + ":" + couch_port + "/" + "lims_users_repo",args, function(data)
	{  res_data = JSON.parse(data);

	});

};


exports.read_data = function read_data(token)
{
    
     couch.db('lims_users_repo', 'view', "token", function (err, pbody) {

            console.log(pbody);

        });

}



exports.create_view = function create_view(callback)
{
    var couchdb = nano.use('lims_users_repo');
    var mapr = function(doc){
        emit([doc.token], doc);
    }

    var ddoc = {
        language: "javascript",
        views: {
            by_token: {
                map: mapr.toString()          
                
            }
        }
    }

    couchdb.insert(ddoc,'_design/token',function(err){
        callback(err);
    })
}


exports.get_tokens = function get_tokens(to)
{
    var couchdb = nano.use('lims_users_repo');

    var getOptions = {
   
        start_key: JSON.stringify([])

    }

    couchdb.get('_design/token/_view/by_token', getOptions, function(err,result){
        console.log(result.rows.length);
    })
}