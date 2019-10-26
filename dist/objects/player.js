"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Style_1 = require("../util/Style");
let volume = 5;
const maxVolume = 7;
const minVolume = 1;
var stream = undefined;
var conn = undefined;
var inVoice = false;
class Player {
    ChangeVolume(amount) {
        changeVolume(amount);
    }
    Play() { }
    Join(message) {
        joinVoice(message);
    }
    Leave(message) {
        leaveVoice(message);
    }
}
function changeVolume(amount) {
    volume += amount;
    if (volume > maxVolume)
        volume = maxVolume;
    else if (volume < minVolume)
        volume = minVolume;
    if (stream)
        stream.setVolume(volume);
}
function joinVoice(message) {
    const vc = message.member.voiceChannel;
    if (!vc)
        Style_1.QuickEmbed(message, `you're not in a voice channel`);
    else if (!vc.joinable)
        Style_1.QuickEmbed(message, `Cant join this voice channel`);
    else {
        message.member.voiceChannel.join().then(connection => {
            conn = connection;
            inVoice = true;
        });
    }
}
function leaveVoice(message) {
    if (message.member.voiceChannel)
        message.member.voiceChannel.connection.disconnect;
    inVoice = false;
}
