"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbUser_1 = require("../db/dbUser");
const Style_1 = require("../util/Style");
const subcmd = [
    {
        name: 'users',
        description: 'list users',
        aliases: ['usr', 'lsusr'],
        execute(message, args) {
            Style_1.QuickEmbed(message, `Searching Database...`);
            const userFields = [];
            dbUser_1.users.forEach(user => {
                const fld = Style_1.createField(user.tag, `nickname: ${user.nickname}\nid:${user.id}\nfavorites: ${user.favorites}}`);
                userFields.push(fld);
            });
            Style_1.ListEmbed(message, `users`, undefined, userFields);
        }
    },
    {
        name: 'test',
        description: "test",
        aliases: ['ts'],
        execute(message, args) {
        }
    }
];
exports.command = {
    name: "admin",
    aliases: ['sys'],
    args: false,
    description: "Admin commands",
    usage: "",
    subCmd: subcmd,
    execute(message, args) {
    }
};
