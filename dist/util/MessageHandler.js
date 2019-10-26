"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const CommandUtil_1 = require("./CommandUtil");
const Style_1 = require("./Style");
function Send(message, content, options) {
    message.channel.send(content, options);
}
exports.Send = Send;
function OnMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!message.content.startsWith(config_1.prefix) || message.author.bot || message.channel.type !== "text")
            return;
        let args = message.content.slice(config_1.prefix.length).split(/ +/);
        //Command name
        let cname = (args.shift() || "none").toLowerCase();
        if (cname.startsWith(config_1.prefix) || cname === "none")
            return;
        const command = CommandUtil_1.CommandUtil.GetCommand(cname);
        if (command === undefined)
            return Style_1.QuickEmbed(message, `Command **${cname}** not found`);
        // Check if args is required
        if (command.args && !args.length) {
            return Send(message, Style_1.darken(`${config_1.prefix}${command.name}`, command.usage || ""));
        }
        let hasPerms = true;
        if (command.perms) {
            command.perms.map(perm => {
                if (perm === "admin") {
                    if (message.author.id !== config_1.admins[0]) {
                        hasPerms = false;
                    }
                }
            });
        }
        if (hasPerms)
            command.execute(message, args);
    });
}
exports.OnMessage = OnMessage;
