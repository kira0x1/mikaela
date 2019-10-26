"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const config_1 = require("../config");
const music_1 = require("../commands/music");
const path_1 = __importDefault(require("path"));
const commands = [];
function Init() {
    music_1.playerInit();
    fs_1.readdirSync(path_1.default.join(__dirname, "..", "commands"))
        .filter(file => file.endsWith("js"))
        .forEach(file => {
        const cmd = require(path_1.default.join(__dirname, "..", "commands", file));
        commands.push(cmd.command);
    });
}
exports.Init = Init;
class CommandUtil {
    static GetCommand(name) {
        //Look for command
        const cmd = commands.find(cmd => cmd.name === name || (cmd.aliases && cmd.aliases.includes(name)));
        if (cmd)
            return cmd;
        //If no command found, then Check subcommands
        let subCmd = undefined;
        commands.find(c => {
            if (c.subCmd)
                subCmd = c.subCmd.find(subC => subC.name === name || (subC.aliases && subC.aliases.includes(name)));
        });
        //Return subcommand
        return subCmd;
    }
    static GetCommands() {
        return commands;
    }
    static FindFlag(name, flags) {
        return flags.find(f => f.name === name || (f.aliases && f.aliases.includes(name)));
    }
    static GetArgs(args, flags, strip) {
        let flagsFound = new discord_js_1.Collection();
        args.map((arg, pos) => {
            if (arg.startsWith(config_1.flagPrefix)) {
                let flagName = args
                    .splice(pos, 1)
                    .toString()
                    .slice(config_1.flagPrefix.length);
                let flagArgs = strip ? args.splice(pos, 1).toString() : "";
                const flag = this.FindFlag(flagName, flags);
                if (flag)
                    flagsFound.set(flag.name, flagArgs);
            }
        });
        return flagsFound;
    }
}
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
