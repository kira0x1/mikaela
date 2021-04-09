import { ICommand } from '../../classes/Command';
import { convertPlaylistToSongs, getSong, isPlaylist } from '../../util/apiUtil';
import { createFavoriteCollector, getPlayer } from '../../util/musicUtil';
import { createFooter, QuickEmbed } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'add',
    description: 'add song to queue',
    usage: '[url | search]',
    args: true,

    async execute(message, args) {
        const player = getPlayer(message)

        //Get the users query
        let query = args.join(' ');

        //Search for song
        const song = await getSong(query);

        //If song not found, tell the user.
        if (!song) return QuickEmbed(message, 'Song not found');

        if (isPlaylist(song)) {
            const playlistSongs = await convertPlaylistToSongs(song);

            const embed = createFooter(message)
                .setTitle(`Playlist: ${song.title}\n${song.items.length} Songs`)

            for (let i = 0; i < playlistSongs.length && i < 20; i++) {
                const psong = playlistSongs[i];
                embed.addField(`${i + 1} ${psong.title}`, psong.url);
                player.queue.addSong(psong);
            }
            message.channel.send(embed);
            return;
        }

        player.queue.addSong(song)

        //Tell the user
        let embed = createFooter(message)
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setTitle(song.title)
            .setDescription(`**Added to queue**\n${song.duration.duration}`)
            .setURL(song.url)

        const msg = await message.channel.send(embed);
        createFavoriteCollector(song, msg)
    }
}