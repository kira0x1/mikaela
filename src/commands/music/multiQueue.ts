import { ICommand } from '../../classes/Command';
import { ISong } from '../../classes/Player';
import { getSong } from '../../util/apiUtil';
import { getPlayer } from '../../util/musicUtil';
import { createFooter } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'multiQueue',
    description: 'Queue multiple songs at once',
    args: true,
    usage: 'song1, song2, song3....',
    aliases: ['mq'],

    async execute(message, args) {
        const content = args.join('').split(',');

        const songs: ISong[] = [];

        await content.forEach(async arg => {
            const res = await getSong(arg);
            songs.push(res);
        });

        const embed = createFooter(message);

        if (songs.length === 0) {
            embed.setTitle('No songs were found');
            message.channel.send(embed);
            return;
        }

        const player = getPlayer(message);
        if (!player) return console.error(`Could not find player for guild ${message.guild.name}`);

        player.addSong(songs[0], message);

        songs.map(song => player.queue.addSong(song));

        embed.setTitle(`Adding ${songs.length} songs to the queue`);
        message.channel.send(embed);
    },
};
