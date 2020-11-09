import { MessageEmbed, MessageReaction, User } from 'discord.js';
import ms from 'ms';
import { ICommand } from '../../classes/Command';
import { CreateUser, IUser } from '../../db/dbUser';
import { getUser } from '../../db/userController';
import { getPlayer } from '../../util/musicUtil';
import { embedColor, QuickEmbed } from '../../util/styleUtil';
import { AddFavorite } from '../favorites/add';
import { heartEmoji } from './play';


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

        const streamTime = (stream.streamTime - stream.pausedTime) / 1000;
        const minutes = Math.floor(streamTime / 60);

        let seconds: number | string = streamTime - minutes * 60;
        seconds = seconds < 10 ? '0' + seconds.toFixed(0) : seconds.toFixed(0);

        const duration = player.currentlyPlaying.duration;

        let prettyTime = minutes.toFixed(0) + ':' + seconds;

        //Create embed
        const embed = new MessageEmbed()
            .setColor(embedColor)
            .setTitle('Playing: ' + currentSong.title)
            .setURL(currentSong.url)
            .addField(`Duration`, `${prettyTime} / ${duration.duration}`);

        const msg = await message.channel.send(embed);
        await msg.react(heartEmoji.id);

        const filter = (reaction: MessageReaction, user: User) => {
            return reaction.emoji.name === heartEmoji.name && !user.bot;
        };

        const collector = msg.createReactionCollector(filter, { time: ms('1h') });

        collector.on('collect', async (reaction, reactionCollector) => {
            const user = reaction.users.cache.last();
            let dbUser = await getUser(user.id);

            if (!dbUser) {
                const iuser: IUser = {
                    username: user.username,
                    tag: user.tag,
                    id: user.id,
                    favorites: [],
                    roles: [],
                    sourcesGroups: [],
                };

                await CreateUser(iuser);
                dbUser = iuser;
            }

            AddFavorite(dbUser, currentSong, message);
        });

        collector.on('end', collected => {
            msg.reactions.removeAll();
        });
    },
};
