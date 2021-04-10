import { Collection, MessageEmbed } from "discord.js";
import { ICommand } from "../../classes/Command";
import { Player } from "../../classes/Player";
import { players } from "../../util/musicUtil";
import { createFooter, addCodeField } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'Players',
    description: 'List all players',
    aliases: ['streams'],
    perms: ['kira'],

    execute(message, args) {
        const embed = createFooter(message).setTitle(`Players: ${players.size}`)
        createPlayersEmbed(embed, players.filter(p => p.isPlaying))

        const notPlaying = players.filter(p => !p.isPlaying).map(p => p.guild.name)
        if (notPlaying.length > 0) addCodeField(embed, '---Not Playing---\n\n' + notPlaying.join('\n'))
        message.channel.send(embed)
    }
}

function createPlayersEmbed(embed: MessageEmbed, players: Collection<string, Player>) {
    players.map(p => embed.addField(p.guild.name, `Playing: **${p.isPlaying}**`))
}