import { Message, MessageEmbed } from 'discord.js';

const redColor = 0xcf274e;
// const blueColor = 0x4e74e6;
// const oldBlueColor = 0x6788eb;

export const embedColor = redColor;

export function darken(...content: string[]): string {
    const tag = `\``;
    return wrap(content, tag);
}

export function wrap(content: string[] | string, wrap: string = '`'): string {
    if (typeof content === 'string') return wrap + content + wrap;

    return content
        .filter(str => str !== ``)
        .map(str => wrap + str + wrap)
        .join(' ');
}

export const errorIconUrl = 'https://cdn.discordapp.com/attachments/702091543514710027/835451455208423424/error_icon.png'
export const successIconUrl = 'https://cdn.discordapp.com/attachments/702091543514710027/835456148811415602/success_icon.png'

export async function sendErrorEmbed(message: Message, errorMessage: string) {
    let embed: MessageEmbed = createFooter(message).setTitle('Error').setDescription(errorMessage);

    await message.channel.send(embed);
}

export function createFooter(message: Message): MessageEmbed {
    const author = message.author

    const embed = new MessageEmbed()
        .setColor(embedColor)
        .setFooter(author.username, author.displayAvatarURL({ dynamic: true }))
        .setTimestamp(Date.now());

    return embed;
}

export function QuickEmbed(message: Message, content: string, withFooter: boolean = true) {
    const embed = withFooter ? createFooter(message) : new MessageEmbed()
    embed.setTitle(content).setColor(embedColor);
    message.channel.send(embed);
}

export function createEmptyField(inline?: boolean | false) {
    return { name: `\u200b`, value: '\u200b', inline: true };
}

export function addCodeField(embed: MessageEmbed, content: string, title?: string, blank?: boolean, lang = 'yaml', inline?: boolean | false) {
    const value = `\`\`\`${lang}\n${content}\`\`\``

    if (title && blank) title = `\u200b\n${title}`
    embed.addField(title ? title : `\u200b`, value, inline)
}