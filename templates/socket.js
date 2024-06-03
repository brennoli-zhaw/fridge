
document.addEventListener("DOMContentLoaded", function() {
const socket = io(ip, { addTrailingSlash: false }); //socketio connection to server//

socket.on("connect", () => {
    console.log("connected");
    document.querySelector(".socket-status").innerHTML = " Connected";
    document.querySelector(".socket-status").classList.remove("disconnected");
    document.querySelector(".socket-status").classList.add("connected");
});

socket.on("disconnect", () => {
    console.log("disconnected");
    document.querySelector(".socket-status").innerHTML = " Disconnected";
    document.querySelector(".socket-status").classList.add("disconnected");
    document.querySelector(".socket-status").classList.remove("connected");
});

// Event sent by Server//
socket.on("socket_sensors", function (data) {
    let myvar = JSON.parse(data);
    sensors = {
        "temperature": 0,
        "humidity": 0,
        "pressure": 0
    }
    for (let key in sensors) {
        sensors[key] = myvar[key];
        if (typeof updateDonut === "undefined") continue;
        updateDonut(key, sensors[key]);
    }
});

socket.on("socket_webcam", function (data) {
    if(typeof data["img"] === "undefined") return;
    let imageBase64 = "data:image/jpeg;base64," + data["img"];
    if( typeof updateWebcam === "undefined" ) return;
    updateWebcam(imageBase64);
});
});
