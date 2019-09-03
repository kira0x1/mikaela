"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Flag = /** @class */ (function () {
    function Flag(flag) {
        this.name = flag.name;
        this.description = flag.description;
        this.aliases = flag.aliases;
    }
    return Flag;
}());
exports.Flag = Flag;
var Command = /** @class */ (function () {
    // wip?: boolean | false;
    function Command(command) {
        this.name = command.name;
        this.description = command.description;
        this.subCmd = command.subCmd;
        this.flags = command.flags;
        // this.wip = command.wip;
        this.perms = command.perms;
        this.usage = command.usage;
        this.aliases = command.aliases;
        this.args = command.args;
        this.cooldown = command.cooldown;
        this.adminOnly = command.adminOnly || false;
    }
    Command.CommandsDir = function (name) {
        return "./subcommands/" + name + "/";
    };
    return Command;
}());
exports.Command = Command;
var SubCommand = /** @class */ (function (_super) {
    __extends(SubCommand, _super);
    function SubCommand() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "";
        return _this;
    }
    SubCommand.prototype.super = function (command) {
        this.name = command.name;
        this.description = command.description;
        this.usage = command.usage;
        this.aliases = command.aliases;
        this.args = command.args;
        this.cooldown = command.cooldown;
        this.adminOnly = command.adminOnly;
    };
    return SubCommand;
}(Command));
exports.SubCommand = SubCommand;
