"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CommandInfo = /** @class */ (function () {
    function CommandInfo(name, description, aliases, commands, perms) {
        this.hidden = false;
        this.perms = [];
        this.name = name;
        this.description = description;
        this.commands = commands;
        this.aliases = aliases;
        if (perms) {
            this.perms = perms;
        }
    }
    return CommandInfo;
}());
exports.CommandInfo = CommandInfo;
