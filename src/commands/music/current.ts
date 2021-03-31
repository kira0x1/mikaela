import { ICommand } from '../../classes/Command';
import { createCurrentlyPlayingEmbed, createFavoriteCollector, getPlayer } from '../../util/musicUtil';
import { QuickEmbed } from '../../util/styleUtil';


export const command: ICommand = {
    name: 'CurrentSong',
    description: 'Display the currently playing song',
    aliases: ['np', 'playing', 'current', 'c'],

    async execute(message, args) {
        //Get the guilds current player
        const player = getPlayer(message);
        if (!player) return;

        const currentSong = player.currentlyPlaying;
        const stream = player.getStream();

        if (!(stream && player.currentlyPlaying)) return QuickEmbed(message, 'No song currently playing');

        //Create embed
        const embed = await createCurrentlyPlayingEmbed(stream, player)

        const msg = await message.channel.send(embed);
        createFavoriteCollector(currentSong, msg)
    },
};
