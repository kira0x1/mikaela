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
var mongoose_1 = require("mongoose");
var database_1 = require("./database");
var config_1 = require("../config");
var guildController_1 = require("./guildController");
var chalk_1 = __importDefault(require("chalk"));
exports.guildSettings = new discord_js_1.Collection();
exports.GuildSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    guildId: { type: String, required: true },
    icon: { type: String, required: true },
    prefix: { type: String, required: true },
    createdAt: Date
});
//Create a UserModel and insert it into the database, returns an error if the user already exists
function CreateGuild(guild) {
    var guildModel = database_1.conn.model("guilds", exports.GuildSchema);
    console.log("creating guild: " + guild.name);
    if (guild instanceof discord_js_1.Guild) {
        var iguild = {
            name: guild.name,
            guildId: guild.id,
            icon: guild.icon,
            prefix: config_1.prefix
        };
        guildModel.create(iguild);
        return iguild;
    }
    else {
        guildModel.create(guild);
        return guild;
    }
}
exports.CreateGuild = CreateGuild;
//Setup guildSettings variable
function InitGuilds(client) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                //Get all the guilds from the database,
                //and then put them in the guildSettings variable
                return [4 /*yield*/, guildController_1.allGuilds().then(function (guilds) {
                        guilds.map(function (guild) {
                            exports.guildSettings.set(guild.guildId, guild);
                        });
                    }).catch(function (err) {
                        console.log(chalk_1.default.bgRed("Error in db: " + err));
                    })
                    //Look through all guilds the bot is in, and if 
                    //the guild isnt in the database then create it
                ];
                case 1:
                    //Get all the guilds from the database,
                    //and then put them in the guildSettings variable
                    _a.sent();
                    //Look through all guilds the bot is in, and if 
                    //the guild isnt in the database then create it
                    client.guilds.map(function (guild) {
                        if (!exports.guildSettings.has(guild.id)) {
                            var guildCreated = CreateGuild(guild);
                            exports.guildSettings.set(guildCreated.guildId, guildCreated);
                        }
                    });
                    exports.guildSettings.map(function (g) { return console.log(g.name); });
                    return [2 /*return*/];
            }
        });
    });
}
exports.InitGuilds = InitGuilds;
