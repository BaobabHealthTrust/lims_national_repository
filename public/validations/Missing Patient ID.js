//Function should return true if record is ok
validator = function(record){
		var valid = false;

        npid = '';
        if(record['patient']) {
            npid = record['patient']['national_patient_id'];
        }

		if(npid && npid != 'null'){
            if (npid.length > 0){
                    valid = true;
            }
		}

		return valid;
	}

module.exports = validator;

	

