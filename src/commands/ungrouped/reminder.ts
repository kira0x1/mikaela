import { Message, MessageEmbed } from 'discord.js';
import ms from 'ms';

import { ICommand } from '../../classes/Command';
import { sendUsage } from '../../util/commandUtil';
import { embedColor, wrap } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'Reminder',
    description: 'Set a reminder',
    aliases: ['remind', 'rm'],
    args: true,
    usage: '[time: 2m] [message: take a break]',

    async execute(message, args) {
        const timeArg = args.shift();
        setReminder(message, timeArg || '', args.join(' '));
    },
};

export function setReminder(message: Message, time: string, content: string) {
    //If user didnt give a message then tell the user the usage of the command
    if (!content || !time) return sendUsage(message, command.name, 'Error setting reminder');

    //Create embed
    const embed = new MessageEmbed()
        .setColor(embedColor)
        .setTitle('Reminder set')
        .setDescription(`remind ${message.author.username} to ${content} in ${time}`);

    //Send embed telling the user that the reminder was created
    message.channel.send(embed);

    //Create reminder time out
    setTimeout(() => {
        message.channel.send(`Reminder to ${wrap(content, '`')}`, { reply: message.author });
    }, ms(time));
}
