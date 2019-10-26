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
const discord_js_1 = require("discord.js");
const config_1 = require("./config");
const dbSetup_1 = require("./db/dbSetup");
const CommandUtil_1 = require("./util/CommandUtil");
const Emoji_1 = require("./util/Emoji");
const MessageHandler_1 = require("./util/MessageHandler");
process.on("unhandledRejection", error => console.error(`Uncaught Promise Rejection`, error));
const client = new discord_js_1.Client();
client.on("ready", () => __awaiter(this, void 0, void 0, function* () {
    CommandUtil_1.Init();
    Emoji_1.init(client);
    console.log(`${client.user.username} online!`);
}));
client.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
    MessageHandler_1.OnMessage(message);
}));
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        yield dbSetup_1.dbinit();
        client.login(config_1.token);
    });
}
init();
// client.login(token);
