//ip address of the running server
var ip = "192.168.1.185:5000"
//ip = "192.168.1.87:5000";

//sensors data
//this is global, so we can repaint the donuts on resize(window width changes)
var windowWidth = window.innerWidth;
var sensors = {
    "temperature": 0,
    "humidity": 0,
    "pressure": 0
}

//line chart colors
var colors = {
    "temperature": "rgba(255, 99, 132, 0.5)",
    "humidity": "rgba(54, 162, 235, 0.5)",
    "pressure": "rgba(255, 206, 86, 0.5)",
}

//gauges values for presentation
var lookUp = {
    "pressure" : {
        "max": 1800,
        //"value": sensors.pressure,
        "thGood" : [900, 1100],
        "thOkay" : [800, 1200],
        "thWarning" : [700, 1300],
        "label" : "Pressure (hPa)"
    },
    "humidity" : {
        "max": 100,
        //"value": sensors.humidity,
        "thGood" : [40, 54],
        "thOkay" : [30, 56],
        "thWarning" : [20, 58],
        "label" : "Humidity (%)"
    },
    "temperature" : {
        "max": 50,
        //"value": sensors.temperature,
        "thGood" : [2, 4],
        "thOkay" : [1, 12],
        "thWarning" : [0, 14],
        "label" : "Temperature (°C)"
    }
}

//stores chart objects
//initially we had multiple charts, but we decided to keep only one
var dataSensorEndpoints = {
    /* 'getMonthData': false,
    'getYearData': false,
    'getDateData': false, */
    'getTimestampRangeData': false,
}

var Donuts = [];