"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../config");
var CommandUtil_1 = require("./CommandUtil");
var Style_1 = require("./Style");
var messageInstance;
function Send(content, options) {
    messageInstance.channel.send(content, options);
}
exports.Send = Send;
function GetMessage() {
    return messageInstance;
}
exports.GetMessage = GetMessage;
function OnMessage(message) {
    if (!message.content.startsWith(config_1.prefix) || message.author.bot || message.channel.type !== "text")
        return;
    var args = message.content.slice(config_1.prefix.length).split(/ +/);
    messageInstance = message;
    //Command name
    var cname = (args.shift() || "none").toLowerCase();
    if (cname.startsWith(config_1.prefix) || cname === "none")
        return;
    var command = CommandUtil_1.CommandUtil.GetCommand(cname);
    if (command === undefined)
        return Style_1.QuickEmbed("Command **" + cname + "** not found");
    if (command.args && !args.length) {
        // Check if args is required
        return Send(Style_1.darken("" + config_1.prefix + command.name, command.usage || ""));
    }
    var hasPerms = true;
    if (command.perms) {
        command.perms.map(function (perm) {
            if (perm === "admin") {
                if (message.author.id !== config_1.admins[0]) {
                    hasPerms = false;
                }
            }
        });
    }
    if (hasPerms)
        command.execute(message, args);
}
exports.OnMessage = OnMessage;
