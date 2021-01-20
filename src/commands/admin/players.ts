import { ICommand } from "../../classes/Command";
import { players } from "../../util/musicUtil";
import { createFooter } from "../../util/styleUtil";

export const command: ICommand = {
    name: 'Players',
    description: 'List all players',
    aliases: ['streams'],
    perms: ['kira'],

    execute(message, args) {
        const embed = createFooter(message).setTitle(`Player: ${players.size}`)
        players.map(p => embed.addField(p.guild.name, `IsPlaying: ${p.isPlaying}`))

        message.channel.send(embed)
    }
}