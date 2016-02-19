/**
 * Created by chimwemwe on 2/4/16.
 */

"use strict"

var remoteSearchURL = "/query_order/";

var localSearchURL = "http://localhost/chai/test/query.php?id=";

var localCreateURL = "http://localhost/chai/test/create.php";

var localQueryURL = "http://localhost/chai/test/query.php";

var localViewOnlyURL = "http://localhost:3000/lims/show/";

var noLocalCopy = false;

var globalJson = {};

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

                globalJson = json;

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
        national_patient_id: (json.patient.national_patient_id || "").trim(),
        health_facility_name: (json.sending_facility || "").trim(),
        first_name: (json.patient.first_name || "").trim(),
        last_name: (json.patient.last_name || "").trim(),
        middle_name: (json.patient.middle_name || "").trim(),
        date_of_birth: (json.patient.date_of_birth || "").trim(),
        gender: (json.patient.gender || "").trim(),
        phone_number: (json.patient.phone_number || "").trim(),
        district: (json.district || "").trim(),
        reason_for_test: (json.reason_for_test || "").trim(),
        sample_collector_last_name: (json.who_order_test.last_name || "").trim(),
        sample_collector_first_name: (json.who_order_test.first_name || "").trim(),
        sample_collector_phone_number: (json.who_order_test.phone_number || "").trim(),
        sample_collector_id: (json.who_order_test.id_number || "").trim(),
        sample_order_location: (json.order_location || "").trim(),
        sample_type: (json.sample_type || "").trim(),
        date_sample_drawn: (json.date_drawn || "").trim(),
        tests: (""),
        sample_priority: (json.priority || "").trim(),
        target_lab: (json.receiving_facility || "").trim(),
        art_start_date: (json.art_start_date || "").trim(),
        date_dispatched: (json.date_dispatched || "").trim(),
        date_received: (json.date_received || "").trim()
    }

    var keys = Object.keys(fields);

    for (var i = 0; i < keys.length; i++) {

        if (__$(keys[i]) && keys[i] != "tests") {

            __$(keys[i]).value = fields[keys[i]];

            if (keys[i] == "sample_type") {

                __$(keys[i]).setAttribute("tag", JSON.stringify(json.test_types));

                __$(keys[i]).onchange = function() {

                    if(this.value.trim().length <= 0)
                        return;

                    ajaxLoad('/sample_tests/' + encodeURI(this.value.trim()), __$('tests'), JSON.parse(this.getAttribute("tag")));

                }

                __$(keys[i]).onchange();

            }

        }

    }

    if(noLocalCopy) {

        var response = confirm("No Local Copy Found. Save Retrieved Record?");

        if(response) {

            saveRemoteRecord(json, localCreateURL);

        }

        noLocalCopy = false;

    } else {

        if(localViewOnlyURL && localViewOnlyURL.trim().length > 0) {

            window.location = localViewOnlyURL + json._id;

        }

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

    var trackingNumber = json._id;

    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {

            if (httpRequest.responseText.trim().length > 0) {

                var json = JSON.parse(httpRequest.responseText);

                if(localViewOnlyURL && localViewOnlyURL.trim().length > 0) {

                    window.location = localViewOnlyURL + trackingNumber;

                }

            }

        }
    }
    httpRequest.open("POST", url, true);
    httpRequest.send(JSON.stringify(json));

}

function decodeEntry(type, value, control) {

    if(!type || !value || !control) {
        return;
    }

    var url = localQueryURL + "?type=" + type + "&value=" + value;

    var httpRequest;
    if (window.XMLHttpRequest) {
        httpRequest = new XMLHttpRequest();
    }

    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {

            if (httpRequest.responseText.trim().length > 0) {

                var result = httpRequest.responseText;

                control.value = result;

            }

        }
    }
    httpRequest.open("GET", url, true);
    httpRequest.send();

}

var intervalTracker;

function trackCustomField(id) {

    intervalTracker = setInterval(function () {

        if (__$(id)) {

            if (__$(id).value.trim().match(/\$/)) {

                __$(id).value = __$(id).value.replace(/\$/g, "");

                queryByTrackingNumber(localSearchURL + __$(id).value.trim(), populateForm,
                        remoteSearchURL + __$(id).value.trim());

            }

        }

    }, 200);

}

function clearCustomTracker() {

    clearInterval(intervalTracker);

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