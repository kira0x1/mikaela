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
var chalk_1 = __importDefault(require("chalk"));
var discord_js_1 = require("discord.js");
var Player_1 = require("./classes/Player");
var play_1 = require("./commands/music/play");
var config_1 = require("./config");
var database_1 = require("./db/database");
var sync_roles_1 = require("./system/sync_roles");
var voice_manager_1 = require("./system/voice_manager");
var commandUtil_1 = require("./util/commandUtil");
var style_1 = require("./util/style");
//FIXME REMEMBER TO CHANGE PREFIX AND DB IN CONFIG BACK TO PRODUCTION SETTINGS
//FIXME REMEMBER TO CHANGE 'TESTING' BACK TO FALL BEFORE UPLOADING
var IS_TESTING = false;
var client = new discord_js_1.Client();
var players = new discord_js_1.Collection();
function init() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, database_1.dbInit()];
                case 1:
                    _a.sent();
                    client.login(config_1.token);
                    return [2 /*return*/];
            }
        });
    });
}
client.on("ready", function () {
    //Save heart emoji to use for favorites
    play_1.initEmoji(client);
    //Add event listener to add/remove voice role
    voice_manager_1.initVoiceManager(client);
    //Add event listeners to #roles
    sync_roles_1.syncRoles(client);
    //Read command files and set it to a array
    commandUtil_1.InitCommands();
    //FIXME REMOVE AFTER SETUP
    // InitGuilds(client)
    console.log(chalk_1.default.bgCyan.bold(client.user.username + " online!"));
    //Setup players
    client.guilds.map(function (guild) {
        console.log(chalk_1.default.bgBlue.bold("" + guild.name));
        players.set(guild.id, new Player_1.Player(guild, client));
    });
});
//Called when a member joins a server
client.on("guildMemberAdd", function (member) {
    //Check if is testing
    if (IS_TESTING)
        return;
    //Check if member is from coders club
    if (member.guild.id !== config_1.coders_club_id)
        return;
    //setup content message
    var content = ">>> Welcome **" + member.toString() + "**";
    content += "\nYou can pick out some roles from **<#618438576119742464>**";
    //get codersclub
    var guild = client.guilds.get(config_1.coders_club_id);
    if (!guild)
        return console.log("guild not found");
    //get welcome channel
    var channel = guild.channels.get("647099246436286494");
    if (!channel)
        return;
    //send welcome message
    if ((function (channel) { return channel.type === "text"; })(channel)) {
        channel.send(content);
    }
    else {
        console.log("channel problem");
    }
});
//OnMessage
client.on("message", function (message) {
    //Check if message is from a bot and that the message starts with the prefix
    if (message.author.bot || !message.content.startsWith(config_1.prefix)) {
        return;
    }
    //Check if is testing and not in coders club
    if (IS_TESTING && message.guild.id !== config_1.coders_club_id)
        return;
    //Split up message into an array and remove the prefix
    var args = message.content.slice(config_1.prefix.length).split(/ +/);
    //Remove the first element from the args array ( this is the command name )
    var commandName = args.shift();
    if (!commandName || commandName.includes(config_1.prefix) || commandName === config_1.prefix)
        return;
    //Set commandName to lowercase
    commandName = commandName.toLowerCase();
    //Search for the command
    var command = commandUtil_1.FindCommand(commandName);
    //If the command wasnt found check if its in a commandgroup
    if (!command) {
        var grp = commandUtil_1.FindCommandGroup(commandName);
        if (grp) {
            commandName = args.shift();
            if (!commandName)
                return;
            command = grp.find(function (cmd) { return cmd.name.toLowerCase() === commandName || cmd.aliases && cmd.aliases.find(function (al) { return al === commandName; }); });
        }
    }
    //If command not found send a message
    if (!command)
        return style_1.QuickEmbed(message, "command " + style_1.wrap(commandName || "") + " not found");
    var canUseCommand = true;
    if (message.guild.id === "413059339138629632") {
        if (message.channel.id === "595870992476274688") {
            commandUtil_1.commandGroups.find(function (commands, key) { return key === "music"; }).map(function (cmd) {
                if (command && command.name === cmd.name)
                    canUseCommand = false;
            });
        }
    }
    if (!canUseCommand) {
        return message.member.send("You cant use music commands in general");
    }
    if (command.args && args.length === 0) {
        var usageString = "Arguments required";
        var embed = new discord_js_1.RichEmbed();
        embed.setColor(style_1.embedColor);
        if (command.usage) {
            usageString = command.name + " ";
            usageString += style_1.wrap(command.usage, "`");
        }
        embed.addField("Arguments Required", usageString);
        return message.channel.send(embed);
    }
    try {
        command.execute(message, args);
    }
    catch (err) {
        console.error(err);
    }
});
function getPlayer(message) {
    return players.get(message.guild.id);
}
exports.getPlayer = getPlayer;
init();
// client.login(token)
