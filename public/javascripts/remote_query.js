/**
 * Created by chimwemwe on 2/4/16.
 */

"use strict"

var localSearchURL = "/query_order/";

var remoteSearchURL = "/query_order/";

function __$(id) {

    return document.getElementById(id);

}

function queryByTrackingNumber(url, callback, retryURL) {

    if (url.trim().length <= 0) {

        alert("No valid path given!");

        return;

    }

    var httpRequest;
    if (window.XMLHttpRequest) {
        httpRequest = new XMLHttpRequest();
    }

    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {

            if (httpRequest.responseText.trim().length > 0) {

                var json = JSON.parse(httpRequest.responseText);

                if (Object.keys(json).length > 0) {

                    callback(json);

                } else if (retryURL) {

                    queryByTrackingNumber(retryURL, callback);

                } else {

                    alert("No match found anywhere!");

                }

            }

        }
    }
    httpRequest.open("GET", url, true);
    httpRequest.send();

}

function populateForm(json) {

    var fields = {
        national_patient_id: (json.patient.national_patient_id || ""),
        health_facility_name: (json.sending_facility || ""),
        first_name: (json.patient.first_name || ""),
        last_name: (json.patient.last_name || ""),
        middle_name: (json.patient.middle_name || ""),
        date_of_birth: (json.patient.date_of_birth || ""),
        gender: (json.patient.gender || ""),
        phone_number: (json.patient.phone_number || ""),
        district: (json.district || ""),
        reason_for_test: (json.reason_for_test || ""),
        sample_collector_last_name: (json.who_order_test.last_name || ""),
        sample_collector_first_name: (json.who_order_test.first_name || ""),
        sample_collector_phone_number: (json.who_order_test.phone_number || ""),
        sample_collector_id: (json.who_order_test.id_number || ""),
        sample_order_location: (json.sample_order_location || ""),
        sample_type: (json.sample_type || ""),
        date_sample_drawn: (json.date_drawn || ""),
        tests: (json.test_type || ""),
        sample_priority: (json.sample_priority || ""),
        target_lab: (json.receiving_facility || ""),
        art_start_date: (json.art_start_date || ""),
        date_dispatched: (json.date_despatched || ""),
        date_received: (json.date_received || "")
    }

    var keys = Object.keys(fields);

    for (var i = 0; i < keys.length; i++) {

        if (__$(keys[i])) {

            __$(keys[i]).value = fields[keys[i]];

            if (keys[i] == "sample_type") {

                __$(keys[i]).onchange();

                var opts = __$("tests").options;

            }

            /*if(keys[i] == "tests") {

             setTimeout((function(ifields) {

             var options = ifields["tests"].split(",");

             for(var o = 0; o < options.length; o++) {

             var opts = __$("tests").options;

             for(var k = 0; k < opts.length; k++) {

             if(opts[k].innerHTML.trim().toLowerCase() == options[o].trim().toLowerCase()) {

             opts.setAttribute("selected", true);

             }

             }

             }

             }(fields)), 5000);

             }*/

        }

        if (keys[i] == "sample_type") {


        }

    }

}

setInterval(function () {

    if (__$("tracking_number")) {

        if (__$("tracking_number").value.trim().match(/\$/)) {

            __$("tracking_number").value = __$("tracking_number").value.replace(/\$/g, "");

            queryByTrackingNumber(localSearchURL + __$("tracking_number").value.trim(), populateForm,
                    remoteSearchURL + __$("tracking_number").value.trim());

        }

    }

}, 200);