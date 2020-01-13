import { RichEmbed } from 'discord.js';
import ms from 'ms';
import { ICommand } from '../../classes/Command';
import { GetUsage } from '../../util/commandUtil';
import { embedColor, QuickEmbed, wrap } from '../../util/Style';

export const command: ICommand = {
    name: "Reminder",
    description: "Set a reminder",
    aliases: ["remind"],
    args: true,
    usage: "[time: 2m] [message: take a break]",

    async execute(message, args) {
        const timeArg = args.shift()
        let time

        //Get the time to wait
        if (timeArg) {
            time = ms(timeArg)
        } else {
            const usage = GetUsage(this.name)
            if (usage) {
                return QuickEmbed(message, usage)
            }
        }

        //Get the users message
        let content = args.join(" ")

        //If user didnt give a message then tell the user the usage of the command
        if (!content) {
            const usage = GetUsage(this.name)
            if (usage) {
                QuickEmbed(message, usage)
            }
            return
        }

        //Create embed
        const embed = new RichEmbed()
            .setColor(embedColor)
            .setTitle("Reminder set")
            .setDescription(`remind ${message.author.username} to ${content} in ${timeArg}`)


        //Send embed telling the user that the reminder was created
        message.channel.send(embed)

        //Create reminder time out
        setTimeout(() => {
            if (content) { message.channel.send(`Reminder to ${wrap(content, "`")}`, { reply: message.author }) }
        }, time)
    }
}