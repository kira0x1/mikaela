import { Client, Message, MessageEmbed } from 'discord.js';
import { CommandError } from '../classes/CommandError';

const redColor = 0xcf274e;
const blueColor = 0x4e74e6;
const oldBlueColor = 0x6788eb;

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

export function createErrorEmbed(client: Client, error: CommandError): MessageEmbed {
    let embed: MessageEmbed = createFooter(client);

    embed.setTitle('Error');
    embed.setDescription(error.message);

    return embed;
}

export function createFooter(client: Client): MessageEmbed {
    const embed = new MessageEmbed();

    embed.setColor(embedColor);

    embed.setFooter(client.user.username, client.user.avatarURL());
    embed.setTimestamp(Date.now());

    return embed;
}

export function QuickEmbed(message: Message, content: string) {
    const embed = new MessageEmbed();

    embed.setTitle(content);
    embed.setColor(embedColor);

    message.channel.send(embed);
}

export function createEmptyField(inline?: boolean | false) {
    return { name: `\u200b`, value: '\u200b', inline: true };
}
