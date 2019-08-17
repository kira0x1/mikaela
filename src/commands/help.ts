import { Command } from '../objects/Command'
import { CommandUtil } from '../util/CommandUtil'
import { ListEmbed } from '../util/Style'

export const command: Command = {
    name: 'help',
    description: 'List Commands',
    aliases: ['h'],
    cooldown: 3,

    async execute(message, args) {
        let fields: Array<{ title: string; content?: string; inline?: boolean }>

        fields = CommandUtil.GetCommands().map(cmd => ({ title: cmd.name, content: cmd.description + '\n \u200b', inline: false }))

        ListEmbed('Commands', undefined, fields)
    },
}
