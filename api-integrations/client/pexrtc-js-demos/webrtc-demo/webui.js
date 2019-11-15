// **** WEBRTC UI **** //

var video;
var bandwidth;
var conference;
var pin;

var rtc = null;

/* ~~~ SETUP AND TEARDOWN ~~~ */

function finalise(event) {
    rtc.disconnect();
    video.srcObject = "";
}

function remoteDisconnect(reason) {
    cleanup();
    alert(reason);
    window.removeEventListener('beforeunload', finalise);
    window.close();
}

function doneSetup(videoURL, pin_status) {
    console.log("PIN status: " + pin_status);
    rtc.connect(pin);
}

function connected(videoURL) {
    video.poster = "";
    video.srcObject = videoURL;
}

function initialise(node, conference, userbw, name, userpin) {
    video = document.getElementById("video");
    console.log("Bandwidth: " + userbw);
    console.log("Conference: " + conference);

    pin = userpin;
    bandwidth = parseInt(userbw);

    rtc = new PexRTC();

    window.addEventListener('beforeunload', finalise);

    rtc.onSetup = doneSetup;
    rtc.onConnect = connected;
    rtc.onError = remoteDisconnect;
    rtc.onDisconnect = remoteDisconnect;

    rtc.makeCall(node, conference, name, bandwidth);
}
