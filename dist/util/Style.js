"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
// export const embedColor = embedColor
exports.embedColor = 0xf70a51;
function darken(...content) {
    const tag = `\``;
    return wrap(content, tag);
}
exports.darken = darken;
function wrap(content, wrap) {
    if (typeof content === "string")
        return wrap + content + wrap;
    return content
        .filter(str => str !== ``)
        .map(str => wrap + str + wrap)
        .join(" ");
}
exports.wrap = wrap;
function QuickEmbed(message, content) {
    const embed = new discord_js_1.RichEmbed().setTitle(content);
    message.channel.send(embed);
}
exports.QuickEmbed = QuickEmbed;
function createEmptyField(inline) {
    return { name: `\u200b`, value: "\u200b", inline: true };
}
exports.createEmptyField = createEmptyField;
function ListEmbed(message, title, description, fields) {
    let embed = new discord_js_1.RichEmbed();
    embed.setColor(exports.embedColor);
    if (title !== undefined)
        embed.addField(title, `\u200b`);
    if (description !== undefined)
        embed.setDescription(description);
    if (fields !== undefined)
        fields.map(field => embed.addField(field.title, field.content, field.inline));
    message.channel.send(embed);
}
exports.ListEmbed = ListEmbed;
function createField(name, content, inline) {
    const field = { name: name, value: content, inline: inline };
    return field;
}
exports.createField = createField;
