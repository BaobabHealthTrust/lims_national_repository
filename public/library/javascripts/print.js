/**
 * Created by chimwemwe on 2/9/16.
 */

"use strict"

function redirect() {

    if(uLocalCreateURL.trim().length > 0) {

        var dates = ["date_time", "date_drawn", "art_start_date", "date_dispatched", "date_received"];

        var date = new Date(uJson.patient.date_of_birth);

        var newDate = date.getFullYear() + (date.getMonth() < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) +
            (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + (date.getHours() < 10 ? "0" +
            date.getHours() : date.getHours()) + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());

        uJson.patient.date_of_birth = newDate;

        for(var i = 0; i < dates.length; i++) {

            var date = new Date(uJson[dates[i]]);

            var newDate = date.getFullYear() + (date.getMonth() < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) +
                (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + (date.getHours() < 10 ? "0" +
                date.getHours() : date.getHours()) + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());

            uJson[dates[i]] = newDate;

        }

        var httpRequest;
        if (window.XMLHttpRequest) {
            httpRequest = new XMLHttpRequest();
        }

        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {

                if (httpRequest.responseText.trim().length > 0) {

                    var json = JSON.parse(httpRequest.responseText);

                    document.location = uPath;

                }

            }
        }
        httpRequest.open("POST", uLocalCreateURL, true);
        httpRequest.send(JSON.stringify(uJson));

    } else {
        document.location = uPath;
    }
}

setTimeout(redirect, 6000);