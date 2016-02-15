/**
 * Created by chimwemwe on 12/8/15.
 */

// http://localhost:3014/lab_order?hide_demographics=false&first_name=Mary&last_name=Banda&gender=F&date_of_birth=1978-03-04&national_patient_id=XXYYZZ&phone_number=0999999999&reason_for_test=Routine&sample_collector_last_name=Doctor&sample_collector_first_name=Test&sample_collector_phone_number=0888888888&sample_collector_id=FVG564&district=Lilongwe&health_facility_name=Kamuzu+Central+Hospital&middle_name=Chipiliro&return_path=http://localhost/lims/lab_order.php&sample_order_location=Ward+4B

"use strict"

var selectedOptions = {};

function __$(id) {
    return document.getElementById(id);
}

function ajaxLoad(url, control, defaultValues) {

    if (control) {

        control.innerHTML = "";

    }

    // var url = "/sample_tests/" + id.toLowerCase().replace(/\s/g, "+");

    var httpRequest;
    if (window.XMLHttpRequest) {
        httpRequest = new XMLHttpRequest();
    }

    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {

            if (httpRequest.responseText.trim().length > 0) {

                var json = JSON.parse(httpRequest.responseText);

                for (var i = 0; i < json.length; i++) {

                    var opt = document.createElement("option");

                    opt.innerHTML = json[i];

                    if(defaultValues) {

                        for(var j = 0; j < defaultValues.length; j++) {

                            if(json[i] == defaultValues[j]) {

                                opt.setAttribute("selected", true);

                            }

                        }

                    }

                    if (control) {

                        control.appendChild(opt);

                    }

                }

            }

        }
    }
    httpRequest.open("GET", url, true);
    httpRequest.send();

}

function validateForm() {

    var controls = ["district", "health_facility_name", "first_name", "last_name", "gender", "date_of_birth",
            "national_patient_id", "reason_for_test", "sample_collector_last_name", "sample_collector_first_name",
            "sample_collector_id", "sample_type", "date_sample_drawn", "tests",
            "target_lab", "sample_order_location", "return_path"];

    for(var i = 0; i < controls.length; i++) {

        if (__$(controls[i])) {

            if(__$(controls[i]).value.trim().length <= 0) {

                showMsg("Please fill all required fields!");

                __$(controls[i]).focus();

                return;

            }

        }

    }

    document.forms[0].submit();

}

function showMsg(msg) {

    alert(msg);

}