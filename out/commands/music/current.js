"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("../../app");
var discord_js_1 = require("discord.js");
var style_1 = require("../../util/style");
exports.command = {
    name: "CurrentSong",
    description: "Display the currently playing song",
    aliases: ['np', 'playing', 'current', 'c'],
    execute: function (message, args) {
        return __awaiter(this, void 0, void 0, function () {
            var player, currentSong, embed, stream, streamTime, minutes, seconds, duration, minutesLeft, secondsLeft, hasPassedFirstMinute;
            return __generator(this, function (_a) {
                player = app_1.getPlayer(message);
                if (player) {
                    currentSong = player.currentlyPlaying;
                    embed = new discord_js_1.RichEmbed();
                    embed.setColor(style_1.embedColor);
                    stream = player.getStream();
                    if (stream && player.currentlyPlaying) {
                        streamTime = stream.time / 1000;
                        minutes = Math.floor(streamTime / 60);
                        seconds = streamTime - (minutes * 60);
                        duration = player.currentlyPlaying.duration;
                        minutesLeft = Number(duration.minutes) * 60;
                        minutesLeft -= stream.time / 1000;
                        // minutesLeft -= seconds
                        minutesLeft /= 60;
                        secondsLeft = minutesLeft * 60;
                        secondsLeft += Number(duration.seconds);
                        secondsLeft -= seconds;
                        secondsLeft = secondsLeft % 60;
                        if (secondsLeft <= 9) {
                            secondsLeft = "0" + secondsLeft.toFixed(0);
                        }
                        else {
                            secondsLeft = secondsLeft.toFixed(0);
                        }
                        secondsLeft = Math.abs(Number(secondsLeft));
                        hasPassedFirstMinute = false;
                        if (!hasPassedFirstMinute && secondsLeft > Number(duration.seconds)) {
                            hasPassedFirstMinute = true;
                            minutesLeft--;
                        }
                        if (currentSong) {
                            embed.setTitle("Playing: " + currentSong.title);
                            embed.setURL(currentSong.url);
                            embed.setDescription("Duration: " + duration.duration);
                            embed.addField("Time left", minutesLeft.toFixed(0) + ":" + secondsLeft);
                        }
                        else {
                            embed.setTitle("No song currently playing");
                        }
                        message.channel.send(embed);
                    }
                }
                return [2 /*return*/];
            });
        });
    }
};
