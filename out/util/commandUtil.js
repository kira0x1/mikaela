"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var CommandInfo_1 = require("../classes/CommandInfo");
var config_1 = require("../config");
var style_1 = require("./style");
exports.commands = new discord_js_1.Collection();
exports.commandGroups = new discord_js_1.Collection();
exports.commandInfos = new discord_js_1.Collection();
function InitCommands() {
    var infos = [];
    fs_1.readdirSync(path_1.default.join(__dirname, '..', 'commands', 'info'))
        .map(function (file) {
        var info = require(path_1.default.join(__dirname, '..', "commands", 'info', file)).info;
        infos.push(info);
    });
    fs_1.readdirSync(path_1.default.join(__dirname, '..', "commands"))
        .filter(function (file) { return file.endsWith("js"); })
        .map(function (file) {
        var command = require(path_1.default.join(__dirname, '..', "commands", file)).command;
        var cmd = command;
        exports.commands.set(cmd.name, cmd);
    });
    fs_1.readdirSync(path_1.default.join(__dirname, '..', "commands"))
        .filter(function (folder) { return folder !== "info"; })
        .filter(function (file) { return file.endsWith(".js") === false; })
        .map(function (folder) {
        var folderCommands = [];
        fs_1.readdirSync(path_1.default.join(__dirname, '..', 'commands', folder))
            .map(function (file) {
            var command = require(path_1.default.join(__dirname, '..', "commands", folder, file)).command;
            var cmd = command;
            folderCommands.push(cmd);
            if (!cmd.isSubCommand) {
                exports.commands.set(cmd.name.toLowerCase(), cmd);
            }
        });
        if (folder) {
            exports.commandGroups.set(folder, folderCommands);
        }
        var info = infos.find(function (cmd) { return cmd.name.toLowerCase() === folder; });
        if (info) {
            var newInfo = new CommandInfo_1.CommandInfo(info.name, info.description, info.aliases, exports.commandGroups.get(info.name.toLowerCase()) || []);
            exports.commandInfos.set(newInfo.name.toLowerCase(), newInfo);
        }
    });
}
exports.InitCommands = InitCommands;
function FindCommand(query) {
    var command = exports.commands.get(query.toLowerCase());
    if (!command) {
        var cmdArray = exports.commands.array();
        command = cmdArray.find(function (cmd) { return cmd.aliases && cmd.aliases.find(function (al) { return al.toLowerCase() === query.toLowerCase(); }); });
    }
    return command;
}
exports.FindCommand = FindCommand;
function FindCommandGroup(query) {
    var grp = exports.commandGroups.get(query);
    if (!grp) {
        var infoFound = exports.commandInfos.find(function (info) { return info.name.toLowerCase() === query.toLowerCase() || info.aliases.includes(query.toLowerCase()); });
        if (infoFound) {
            grp = exports.commandGroups.get(infoFound.name.toLowerCase());
        }
    }
    return grp;
}
exports.FindCommandGroup = FindCommandGroup;
function FindCommandInfo(query) {
    var infoFound = exports.commandInfos.find(function (info) { return info.name.toLowerCase() === query.toLowerCase() || info.aliases.includes(query.toLowerCase()); });
    return infoFound;
}
exports.FindCommandInfo = FindCommandInfo;
function GetUsage(query) {
    var command = FindCommand(query);
    if (!command)
        return console.log("command: " + query + " not found");
    if (command.usage) {
        var usage = style_1.wrap(command.usage, "`");
        return usage;
    }
}
exports.GetUsage = GetUsage;
function HasPerms(userId, query) {
    var command = FindCommand(query);
    var hasPerm = true;
    if (command && command.perms) {
        command.perms.map(function (permName) {
            var perm = config_1.perms.find(function (p) { return p.name === permName; });
            if (perm) {
                hasPerm = perm.users.includes(userId);
            }
        });
    }
    if (!command) {
        var cmdInfo = exports.commandInfos.get(query);
        if (cmdInfo) {
            if (cmdInfo.perms) {
                cmdInfo.perms.map(function (permName) {
                    var perm = config_1.perms.find(function (p) { return p.name === permName; });
                    if (perm) {
                        hasPerm = perm.users.includes(userId);
                    }
                });
            }
        }
    }
    return hasPerm;
}
exports.HasPerms = HasPerms;
