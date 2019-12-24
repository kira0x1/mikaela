import { Message, RichEmbed } from "discord.js";

// export const embedColor = 0xcf274e;
// export const embedColor = 0x6788eb
export const embedColor = 0x4e74e6

export function darken(...content: string[]): string {
    const tag = `\``;
    return wrap(content, tag);
}


export function wrap(content: string[] | string, wrap: string = "`"): string {
    if (typeof content === "string") return wrap + content + wrap;

    return content
        .filter(str => str !== ``)
        .map(str => wrap + str + wrap)
        .join(" ");
}

export function QuickEmbed(message: Message, content: string) {
    const embed = new RichEmbed()
        .setTitle(content)
        .setColor(embedColor)

    message.channel.send(embed);
}

export function createEmptyField(inline?: boolean | false) {
    return { name: `\u200b`, value: "\u200b", inline: true };
}
