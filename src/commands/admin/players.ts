import { Collection, MessageEmbed } from "discord.js";
import { ICommand } from "../../classes/Command";
import { Player } from "../../classes/Player";
import { players } from "../../util/musicUtil";
import { createFooter } from "../../util/styleUtil";

export const command: ICommand = {
    name: 'Players',
    description: 'List all players',
    aliases: ['streams'],
    perms: ['admin'],

    execute(message, args) {
        const embed = createFooter(message).setTitle(`Player: ${players.size}`)

        createPlayersEmbed(embed, players.filter(p => p.isPlaying))
        createPlayersEmbed(embed, players.filter(p => !p.isPlaying))

        message.channel.send(embed)
    }
}

function createPlayersEmbed(embed: MessageEmbed, players: Collection<string, Player>) {
    players.map(p => embed.addField(p.guild.name, `Playing: **${p.isPlaying}**`))
}