"use strict"

var fs = require('fs');
var path = require("path");
var client = require('node-rest-client').Client;
var couch = require(path.resolve('public', 'library', 'javascripts', 'couch.js'));
var configs = fs.readFileSync(path.resolve('config', 'couchdb.json'));
var md5 = require("md5");


var couch_protocol = JSON.parse(configs)['protocol'];
var couch_site_code = JSON.parse(configs)['site_code'];
var couch_host =  JSON.parse(configs)['host'];
var couch_username = JSON.parse(configs)['username'];
var couch_password = JSON.parse(configs)['password'];
var couch_port = JSON.parse(configs)['port'];
var md5 = require("md5");
var randomstring = require("randomstring");


var nano = require('nano')(couch_protocol + "://" + couch_username + ":" + couch_password + "@" +couch_host + ":" + couch_port);


exports.create_account = function create_account(partner,app_name,origin,password,username,callback)
{
	var res_data;
    var salt =  randomstring.generate(12);
    var passcode = md5(password + salt);

    var token =  randomstring.generate(12);

	 var args = {
            "data": {
                "_id": partner,
                "username": username,
                "salt": salt,
                "application": app_name,
                "site_code": couch_site_code,
                "password": passcode,
                "type": "api_user",
                "token": token,
                "token_expiry_time": ((new Date()).getTime() + (1000 * 60 * 60 * 4)),
                "location": origin,
                "partner": partner,
                "voided": false
            },
            headers: {"Content-Type": "application/json"}
        };


	(new client()).post(couch_protocol + "://" + couch_host + ":" + couch_port + "/" + "lims_users_repo",args, function(data)
	{  res_data = JSON.parse(data);

        if (res_data['ok'])
        {
            callback(false,token);
        }
        else if (res_data['error'])
        {
            callback(true,'');
        }
	});

};


exports.read_data = function read_data(token)
{
    
     couch.db('lims_users_repo', 'view', "token", function (err, pbody) {

            console.log(pbody);

        });

}

exports.authenticate_partner = function authenticate_partner(token,callback)
{
    get_tokens(function(data){
     
        data.rows.forEach(function(d){
          
            if (d.value['token'] == token){ 
                callback(d.value['token_expiry_time']);
            }
        })

    })
}

exports.create_view = function create_view(callback)
{
    var couchdb = nano.use('lims_users_repo');
    var mapr = function(doc){
        emit([doc.token], doc);
    }

    var maprr = function(doc){
        emit([doc.username], doc);
    }

    var ddoc = {
        language: "javascript",
        views: {
            by_token: {
                map: mapr.toString()          
                
            },
            by_username_password: {
                map: maprr.toString()
            }
        }
    }

    couchdb.insert(ddoc,'_design/token',function(err){
        callback(err);
    })
}


function get_tokens(callback)
{
    var couchdb = nano.use('lims_users_repo');

    var getOptions = {
   
        start_key: JSON.stringify([])

    }

    couchdb.get('_design/token/_view/by_token', getOptions, function(err,result){
        callback(result);
    })
}


exports.re_authenticate = function re_authenticate(username,password,callback)
{
        var couchdb = nano.use('lims_users_repo');

        var getOptions = {
       
            start_key: JSON.stringify([])

        }
        var checker = false;
        couchdb.get('_design/token/_view/by_username_password', getOptions, function(err,result){
    
            var counter = 0;
            result.rows.forEach(function(d){
            counter++;
                if (d.key[0] == username)
                {   
                    var salt = d.value.salt;
                    var pas = md5(password+salt);
                   
                    if (pas == d.value.password)
                    {   
                        var token  =   randomstring.generate(12);
                        
                            var args = {
                                    "_id": d.value._id,
                                    "_rev": d.value._rev,
                                    "username": d.value.username,
                                    "salt": d.value.salt,
                                    "application": d.value.app_name,
                                    "site_code": d.value.site_code,
                                    "password": d.value.password,
                                    "type": "api_user",
                                    "token": token,
                                    "token_expiry_time": ((new Date()).getTime() + (1000 * 60 * 60 * 4)),
                                    "location": d.value.location,
                                    "partner": d.value.partner,
                                    "voided": false
                                    
                                };

                        couch.db('lims_users_repo', 'save', args, function (error, body) {
                            if (!error) {
                              
                                callback(true,token);

                            } else {

                                callback(false);

                            }

                        });

                    }      
                    else
                    {
                        if (counter == result.rows.length)
                        {
                            callback(false,'gd');   
                        }

                    }          

                }
                else
                {
                    if (counter == result.rows.length)
                    {
                        callback(false,'gd');   
                    }

                }


            });


        });
}