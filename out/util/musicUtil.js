"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ConvertDuration(duration_seconds) {
    var minutes = Math.floor(Number(duration_seconds) / 60);
    var seconds = Math.floor(Number(duration_seconds) - minutes * 60);
    var hours = Math.floor(minutes / 60);
    if (seconds < 10)
        seconds = "0" + seconds;
    var duration = {
        seconds: seconds.toString(),
        minutes: minutes.toString(),
        hours: hours.toString(),
        duration: minutes + ":" + seconds
    };
    return duration;
}
exports.ConvertDuration = ConvertDuration;
