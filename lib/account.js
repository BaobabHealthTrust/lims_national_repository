'use strict'

var md5 = require("md5");
var randomstring = require("randomstring");
var fs = require('fs');
var path = require("path");
var configs = fs.readFileSync(path.resolve('config', 'couchdb.json'));
var salt;


exports.create_default_account = function create_default_account()
{
	var default_username = JSON.parse(configs)['nlims_default_username'];
	var default_password = JSON.parse(configs)['nlims_default_password'];

	salt =   randomstring.generate(12);
	var passcode = encrypt(default_password,salt);
	
	const default_account = {
	        username: default_username,
	        password: passcode,
	        key: salt
	}	
	fs.writeFile('./lib/default_account.json', JSON.stringify(default_account), function (err) {
	    if (err) throw err;
	    console.log('created successfuly');
	});
}


exports.get_default_account_details = function get_default_account_details(callback)
{	
	fs.readFile('./lib/default_account.json',function(er, contents){
		
		var details = {
			username: JSON.parse(contents)['username'] ,
			password: JSON.parse(contents)['password'],
			salt: JSON.parse(contents)['key'] 
		}
		callback(details);
	})	
}


function encrypt(password,salt)
{		
	return md5(password + salt);
}

exports.decrypt = function decrypt(password,salt)
{
	return md5(password + salt);

}

exports.generate_tmp_token = function generate_tmp_token()
{
	var token =  randomstring.generate(12);

	return token;
}