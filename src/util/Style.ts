import { Channel, Client, DMChannel, GuildChannel, Message, MessageEmbed, NewsChannel, TextChannel } from 'discord.js';
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

export function createErrorEmbed(client: Client, message: string): MessageEmbed {
    return createFooter(client)
        .setTitle('Error')
        .setDescription(message);
}

export async function sendErrorEmbed(message: Message, errorMessage: string) {
    let embed: MessageEmbed = createFooter(message.client)
        .setTitle('Error')
        .setDescription(errorMessage);

    await message.channel.send(embed)
}

export function createFooter(client: Client): MessageEmbed {
    const embed = new MessageEmbed()
        .setColor(embedColor)
        .setFooter(client.user.username, client.user.avatarURL())
        .setTimestamp(Date.now());

    return embed;
}

export function QuickEmbed(message: Message, content: string) {
    const embed = new MessageEmbed().setTitle(content).setColor(embedColor);
    message.channel.send(embed);
}

export function createEmptyField(inline?: boolean | false) {
    return { name: `\u200b`, value: '\u200b', inline: true };
}
