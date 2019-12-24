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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var chalk_1 = __importDefault(require("chalk"));
var style_1 = require("../../util/style");
var customRoles = require('../../../customRoles.json');
exports.command = {
    name: "custom-roles",
    description: "setup for custom roles",
    aliases: ["cr"],
    hidden: true,
    perms: ["admin"],
    execute: function (message, args) {
        return __awaiter(this, void 0, void 0, function () {
            var sections, i, section, embedTitle, embed, i_1, role, guildRole, emoji, content, msg, r, emoji, role, sectionRole;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sections = customRoles.sections;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < sections.length)) return [3 /*break*/, 7];
                        section = sections[i];
                        embedTitle = new discord_js_1.RichEmbed();
                        embedTitle.setColor(style_1.embedColor);
                        embedTitle.setTitle("\n\n" + section.name);
                        message.channel.send(embedTitle);
                        embed = new discord_js_1.RichEmbed();
                        embed.setColor(style_1.embedColor);
                        for (i_1 = 0; i_1 < section.roles.length; i_1++) {
                            role = section.roles[i_1];
                            guildRole = findRole(message, role.roleId);
                            if (!guildRole)
                                return [2 /*return*/, console.log(chalk_1.default.bgRed("could not find guild role " + role.roleId))];
                            emoji = findEmoji(message, role.reactionName);
                            if (!emoji)
                                return [2 /*return*/, console.log(chalk_1.default.bgRed("could not find emoji " + role.reactionId))];
                            content = emoji.toString();
                            if (i_1 < section.roles.length - 1) {
                                content += "\n\u200b";
                            }
                            embed.addField("**" + role.name + "**", content, true);
                        }
                        return [4 /*yield*/, message.channel.send(embed)];
                    case 2:
                        msg = _a.sent();
                        if (!(msg instanceof discord_js_1.Message)) return [3 /*break*/, 6];
                        r = 0;
                        _a.label = 3;
                    case 3:
                        if (!(r < section.roles.length)) return [3 /*break*/, 6];
                        emoji = findEmoji(msg, section.roles[r].reactionName);
                        if (!emoji) return [3 /*break*/, 5];
                        return [4 /*yield*/, msg.react(emoji)];
                    case 4:
                        _a.sent();
                        role = msg.guild.roles.get(section.roles[r].roleId);
                        if (role) {
                            sectionRole = msg.guild.roles.get(section.id);
                            if (!sectionRole)
                                return [2 /*return*/, console.log("couldnt find section role")];
                            addCollector(msg, emoji, role, sectionRole);
                        }
                        else {
                            console.log("role not found");
                        }
                        _a.label = 5;
                    case 5:
                        r++;
                        return [3 /*break*/, 3];
                    case 6:
                        i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
};
function addCollector(message, emoji, role, sectionRole) {
    var _this = this;
    var filter = function (reaction, user) {
        return reaction.emoji === emoji && !user.bot;
    };
    var collector = message.createReactionCollector(filter);
    collector.on("collect", function (reaction) { return __awaiter(_this, void 0, void 0, function () {
        var user, member;
        return __generator(this, function (_a) {
            user = reaction.users.last();
            member = message.guild.members.get(user.id);
            if (!member)
                return [2 /*return*/, console.log("couldnt find member")];
            if (!role)
                return [2 /*return*/, console.log(chalk_1.default.bgRed.bold("role undefined"))];
            console.log(chalk_1.default.bgGreen.bold("Added role from user " + user.username));
            member.addRole(role);
            member.addRole(sectionRole);
            return [2 /*return*/];
        });
    }); });
    message.guild.client.on('messageReactionRemove', function (reaction, user) {
        var member = message.guild.members.get(user.id);
        if (!member)
            return console.log("couldnt find member");
        if (reaction.message.id === message.id && user.bot === false && reaction.emoji === emoji) {
            if (member.roles.find(function (rl) { return rl.id === role.id; })) {
                console.log(chalk_1.default.bgMagenta.bold("Removed role from user " + user.username));
                member.removeRole(role);
                member.removeRole(sectionRole);
            }
        }
    });
}
function react(message, emoji) {
    message.react(emoji);
}
function findRole(message, id) {
    var client = message.client;
    var guild = client.guilds.get("585850878532124672");
    if (!guild)
        return;
    return guild.roles.find(function (role) { return role.id === id; });
}
function findEmoji(message, name) {
    var client = message.client;
    var guild = client.guilds.get("585850878532124672");
    if (!guild)
        return;
    return guild.emojis.find(function (em) { return em.name === name; });
}
