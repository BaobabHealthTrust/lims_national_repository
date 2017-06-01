//Function should return true if record is ok
validator = function(record){
		var valid = false;

		if((record['patient'] && record['patient']['gender'] == 'F') ||
            (record['patient'] && record['patient']['gender'] == 'M')){
			valid = true;
		}

		return valid;
}

module.exports = validator;

	

