import { ICommand } from '../../classes/Command';
import { getPlayer } from '../../util/musicUtil';
import { createFooter, QuickEmbed } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'Reload',
    description: 'If the music player froze then you can use this command to reload all the songs and restart',

    execute(message, args) {
        const player = getPlayer(message)
        if (!player.isPlaying && player.queue.songs.length === 0) return QuickEmbed(message, "No song currently playing to reload")

        const embed = createFooter(message)
            .setTitle(`Reloading ${player.queue.songs.length} Song(s)`)

        const prevSongs = player.queue.songs

        prevSongs.map((song, index) => {
            embed.addField(`${index + 1} ${song.title}`, song.url);
        });

        message.channel.send(embed)
        player.reload(message)
    }
}