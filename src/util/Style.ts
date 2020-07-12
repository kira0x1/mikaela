import { Message, MessageEmbed } from 'discord.js';
import { CommandError } from '../classes/CommandError';

const redColor = 0xcf274e;
const blueColor = 0x4e74e6;
const oldBlueColor = 0x6788eb;

export const embedColor = redColor;

export const avatarURL = 'https://cdn.discordapp.com/avatars/585874337618460672/14e6701eba2f119aedb8652d97883166.webp?size=4096';
export const botName = 'Mikaela';

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

export function ErrorEmbed(error: CommandError) {
    const options = {
        'title': 'Error',
        'description': error.message,
        'color': embedColor,
        'timestamp': Date.now(),
        'footer': {
            'text': 'Mikaela',
            'icon_url': avatarURL
        }
    }

    return new MessageEmbed(options);
}

export function QuickEmbed(message: Message, content: string) {
    const embed = new MessageEmbed()

    embed.setTitle(content);
    embed.setColor(embedColor);

    message.channel.send(embed);
}

export function createEmptyField(inline?: boolean | false) {
    return { name: `\u200b`, value: '\u200b', inline: true };
}
