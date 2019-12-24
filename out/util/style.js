"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
// export const embedColor = 0xcf274e;
// export const embedColor = 0x6788eb
exports.embedColor = 0x4e74e6;
function darken() {
    var content = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        content[_i] = arguments[_i];
    }
    var tag = "`";
    return wrap(content, tag);
}
exports.darken = darken;
function wrap(content, wrap) {
    if (wrap === void 0) { wrap = "`"; }
    if (typeof content === "string")
        return wrap + content + wrap;
    return content
        .filter(function (str) { return str !== ""; })
        .map(function (str) { return wrap + str + wrap; })
        .join(" ");
}
exports.wrap = wrap;
function QuickEmbed(message, content) {
    var embed = new discord_js_1.RichEmbed()
        .setTitle(content)
        .setColor(exports.embedColor);
    message.channel.send(embed);
}
exports.QuickEmbed = QuickEmbed;
function createEmptyField(inline) {
    return { name: "\u200B", value: "\u200b", inline: true };
}
exports.createEmptyField = createEmptyField;
