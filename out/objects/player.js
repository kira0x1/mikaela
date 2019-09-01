"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Style_1 = require("../util/Style");
var volume = 5;
var maxVolume = 7;
var minVolume = 1;
var stream = undefined;
var conn = undefined;
var inVoice = false;
var Player = /** @class */ (function () {
    function Player() {
    }
    Player.prototype.ChangeVolume = function (amount) {
        changeVolume(amount);
    };
    Player.prototype.Play = function () { };
    Player.prototype.Join = function (message) {
        joinVoice(message);
    };
    Player.prototype.Leave = function (message) {
        leaveVoice(message);
    };
    return Player;
}());
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
    var vc = message.member.voiceChannel;
    if (!vc)
        Style_1.QuickEmbed("you're not in a voice channel");
    else if (!vc.joinable)
        Style_1.QuickEmbed("Cant join this voice channel");
    else {
        message.member.voiceChannel.join().then(function (connection) {
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
