'use strict'

var md5 = require("md5");
var randomstring = require("randomstring");
var fs = require('fs');

var salt;
exports.create_default_account = function create_default_account()
{
	salt =   randomstring.generate(12);
	var passcode = encrypt("lims","2KClKj7lICtC");
	
	const default_account = {
	        username: "lims",
	        password: passcode,
	        key: salt
	}	
	fs.writeFile('./lib/default_account.json', JSON.stringify(default_account), function (err) {
	    if (err) throw err;
	        console.log('created successfuly');
	});
}

function encrypt(password,salt)
{		
	return md5(password + salt);
}

function decrypt(password,salt)
{
	return md5(passcode + salt);
}