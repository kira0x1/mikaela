import { MessageOptions, Message } from 'discord.js'
import { prefix } from '../config'
import { QuickEmbed } from './Style'
import { darken } from './Style'
import { CommandUtil } from './CommandUtil'

let messageInstance: Message

export function Send(content?: any, options?: MessageOptions) {
    messageInstance.channel.send(content, options)
}

export function GetMessage() {
    return messageInstance
}

export function OnMessage(message: Message) {
    if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type !== 'text')
        return

    let args = message.content.slice(prefix.length).split(/ +/)
    messageInstance = message

    //Command name
    let cname = (args.shift() || 'none').toLowerCase()
    if (cname === prefix || cname === 'none') return

    const command = CommandUtil.GetCommand(cname) || undefined
    if (command === undefined) return QuickEmbed(`Command **${cname}** not found`)

    if (command.args && !args.length) {
        // Check if args is required
        return Send(darken(`${prefix}${command.name}`, command.usage || ''))
    }

    command.execute(message, args)
}