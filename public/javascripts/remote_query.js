/**
 * Created by chimwemwe on 2/4/16.
 */

"use strict"

var localSearchURL = "http://localhost/chai/test/query.php?id=";

var remoteSearchURL = "/query_order/";

var localCreateURL = "http://localhost/chai/test/create.php";

var noLocalCopy = false;

function __$(id) {

    return document.getElementById(id);

}

function queryByTrackingNumber(url, callback, retryURL) {

    clearFields();

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

                    noLocalCopy = true;

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
        sample_order_location: (json.order_location || ""),
        sample_type: (json.sample_type || ""),
        date_sample_drawn: (json.date_drawn || ""),
        tests: (json.test_type || ""),
        sample_priority: (json.priority || ""),
        target_lab: (json.receiving_facility || ""),
        art_start_date: (json.art_start_date || ""),
        date_dispatched: (json.date_dispatched || ""),
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

        }

        if (keys[i] == "sample_type") {


        }

    }

    if(noLocalCopy) {

        var response = confirm("No Local Copy Found. Save Retrieved Record?");

        if(response) {

            saveRemoteRecord(json, localCreateURL);

        }

        noLocalCopy = false;

    }

}

function clearFields() {

    var fields = {
        national_patient_id: "",
        health_facility_name: "",
        first_name: "",
        last_name: "",
        middle_name: "",
        date_of_birth: "",
        gender: "",
        phone_number: "",
        district: "",
        reason_for_test: "",
        sample_collector_last_name: "",
        sample_collector_first_name: "",
        sample_collector_phone_number: "",
        sample_collector_id: "",
        sample_order_location: "",
        sample_type: "",
        date_sample_drawn: "",
        tests: "",
        sample_priority: "",
        target_lab: "",
        art_start_date: "",
        date_dispatched: "",
        date_received: ""
    }

    var keys = Object.keys(fields);

    for (var i = 0; i < keys.length; i++) {

        if (__$(keys[i])) {

            __$(keys[i]).value = fields[keys[i]];

        }
    }

}

/*
 var json = {
 "_id": "XKCH1625002",
 "_rev": "1-1cdbba07933b8ec793980571322dedf2",
 "accession_number": "10002",
 "patient": {
 "national_patient_id": "XXXYYY",
 "first_name": "John",
 "middle_name": "Yohane",
 "last_name": "Banda",
 "date_of_birth": "2008021300000",
 "gender": "M",
 "phone_number": "N/A"
 },
 "sample_type": "DBS (Using capillary tube)",
 "who_order_test": {
 "first_name": "User",
 "last_name": "Trial",
 "id_number": "P3920",
 "phone_number": "09999999"
 },
 "date_drawn": "20160205143917",
 "date_dispatched": "20160205143917",
 "art_start_date": "20100406143917",
 "date_received": "20160205143917",
 "sending_facility": "Kamuzu (KCH) Central Hospital",
 "receiving_facility": "Kamuzu (KCH) Central Hospital",
 "reason_for_test": "Targeted (Treatment Failure Suspected)",
 "test_types": [
 "WBC",
 "RBC"
 ],
 "status": "Drawn",
 "district": "Lilongwe",
 "priority": "Routine",
 "order_location": "Ward 4B",
 "results": {
 },
 "date_time": "20160205143917"
 };

 saveRemoteRecord(json, localCreateURL);
 */

function saveRemoteRecord(json, url) {

    var dates = ["date_time", "date_drawn", "art_start_date", "date_dispatched", "date_received"];

    var date = new Date(json.patient.date_of_birth);

    var newDate = date.getFullYear() + (date.getMonth() < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) +
        (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + (date.getHours() < 10 ? "0" +
        date.getHours() : date.getHours()) + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());

    json.patient.date_of_birth = newDate;

    for(var i = 0; i < dates.length; i++) {

        var date = new Date(json[dates[i]]);

        var newDate = date.getFullYear() + (date.getMonth() < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) +
            (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + (date.getHours() < 10 ? "0" +
            date.getHours() : date.getHours()) + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());

        json[dates[i]] = newDate;

    }

    var httpRequest;
    if (window.XMLHttpRequest) {
        httpRequest = new XMLHttpRequest();
    }

    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {

            if (httpRequest.responseText.trim().length > 0) {

                var json = JSON.parse(httpRequest.responseText);

                console.log(json);

            }

        }
    }
    httpRequest.open("POST", url, true);
    httpRequest.send(JSON.stringify(json));

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