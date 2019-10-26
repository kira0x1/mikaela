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
const CommandUtil_1 = require("../util/CommandUtil");
const flags = [
    {
        name: "me",
        aliases: ["m"],
        description: "Deletes users messages instead of the bots"
    },
    { name: "force", aliases: ["f"], description: "Force a command" },
    {
        name: "both",
        aliases: ["b"],
        description: "Deletes **both** the bots and the users messages"
    },
    { name: "bots", aliases: ["bot", "bt"], description: "Delete bot messages" }
];
exports.command = {
    name: "delete",
    description: "Delete Mikaelas last message(s)",
    perms: ["admin"],
    aliases: ["d", "dl", "del"],
    //ANCHOR Execute
    execute(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const flagsFound = yield CommandUtil_1.CommandUtil.GetArgs(args, flags);
            let amount = 1;
            let force = false;
            const arg = args.shift();
            if (isNaN(Number(arg)))
                amount = 1;
            else
                amount = Number(arg);
            if (!force && (amount < 1 || amount > 25))
                return message.reply("`amount must be between 1 - 25`");
            if (amount > 35)
                return message.reply(`\`Amount cant excede 35\``);
            amount++;
            message.channel.fetchMessages({ limit: amount }).then((messages) => __awaiter(this, void 0, void 0, function* () {
                const purgable = [];
                const flag = flagsFound.firstKey();
                switch (flag) {
                    case "me":
                        messages.filter(m => m.author.id === message.author.id).map(m => purgable.push(m));
                        break;
                    case "both":
                        messages
                            .filter(m => m.author.id === message.author.id || m.author.id === message.client.user.id)
                            .map(m => purgable.push(m));
                        break;
                    case "bots":
                        messages.filter(m => m.author.bot).map(m => purgable.push(m));
                        break;
                }
                if (!flag) {
                    messages.filter(m => m.author.id === message.client.user.id).map(m => purgable.push(m));
                }
                if (!purgable.length)
                    return;
                try {
                    message.channel.bulkDelete(purgable);
                    message.delete().catch(() => { });
                }
                catch (err) {
                    console.error(`error while trying to delete\n\n${err}`);
                }
            }));
        });
    }
};
