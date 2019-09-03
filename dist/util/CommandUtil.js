"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var fs_1 = require("fs");
var config_1 = require("../config");
var music_1 = require("../commands/music");
var path_1 = __importDefault(require("path"));
var commands = [];
function Init() {
    music_1.playerInit();
    fs_1.readdirSync(path_1.default.join(__dirname, "..", "commands"))
        .filter(function (file) { return file.endsWith("js"); })
        .forEach(function (file) {
        var cmd = require(path_1.default.join(__dirname, "..", "commands", file));
        commands.push(cmd.command);
    });
}
exports.Init = Init;
var CommandUtil = /** @class */ (function () {
    function CommandUtil() {
    }
    CommandUtil.GetCommand = function (name) {
        //Look for command
        var cmd = commands.find(function (cmd) { return cmd.name === name || (cmd.aliases && cmd.aliases.includes(name)); });
        if (cmd)
            return cmd;
        //If no command found, then Check subcommands
        var subCmd = undefined;
        commands.find(function (c) {
            if (c.subCmd)
                subCmd = c.subCmd.find(function (subC) { return subC.name === name || (subC.aliases && subC.aliases.includes(name)); });
        });
        //Return subcommand
        return subCmd;
    };
    CommandUtil.GetCommands = function () {
        return commands;
    };
    CommandUtil.FindFlag = function (name, flags) {
        return flags.find(function (f) { return f.name === name || (f.aliases && f.aliases.includes(name)); });
    };
    CommandUtil.GetArgs = function (args, flags, strip) {
        var _this = this;
        var flagsFound = new discord_js_1.Collection();
        args.map(function (arg, pos) {
            if (arg.startsWith(config_1.flagPrefix)) {
                var flagName = args
                    .splice(pos, 1)
                    .toString()
                    .slice(config_1.flagPrefix.length);
                var flagArgs = strip ? args.splice(pos, 1).toString() : "";
                var flag = _this.FindFlag(flagName, flags);
                if (flag)
                    flagsFound.set(flag.name, flagArgs);
            }
        });
        return flagsFound;
    };
    return CommandUtil;
}());
exports.CommandUtil = CommandUtil;
// const logger = createLogger({
// level: "info",
// format: format.combine(format.errors({ stack: true }), format.splat(), format.json()),
// transports: [
// new transports.Console({
// format: format.combine(format.colorize(), format.simple())
// })
// ]
// });
// export function log(content: string) {
// logger.info(content);
// }
