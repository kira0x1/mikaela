import { Client, Emoji, Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import ms from 'ms';

import { getPlayer } from '../../app';
import { ICommand } from '../../classes/Command';
import { ISong } from '../../classes/Player';
import { coders_club_id } from '../../config';
import { CreateUser, IUser } from '../../db/dbUser';
import { getUser } from '../../db/userController';
import { getSong } from '../../util/Api';
import { embedColor, QuickEmbed } from '../../util/Style';
import { AddFavorite } from '../favorites/add';

let heartEmoji: Emoji;

export function initEmoji(client: Client) {
    const coders_club = client.guilds.cache.get(coders_club_id);
    if (!coders_club) return;

    const emoji = coders_club.emojis.cache.find(em => em.name === 'heart');
    if (!emoji) return console.log(`emoji not found`);

    heartEmoji = emoji;
}

export const command: ICommand = {
    name: 'play',
    description: 'Play a song',
    aliases: ['p'],
    usage: '[song]',
    args: true,

    async execute(message: Message, args: string[]) {
        //Get the users query
        let query = args.join(' ');

        //Search for song
        getSong(query)
            .then(song => {
                //Play song
                playSong(message, song);
            })
            .catch(err => {
                //If song not found, tell the user.
                QuickEmbed(message, 'Song not found');
            });
    },
};

export async function playSong(message: Message, song: ISong) {
    //Get the guilds player
    const player = getPlayer(message);

    if (!player) return console.log('couldnt find player');
    if (!song) return message.channel.send('Couldnt find song');

    //Add the song to the player
    player.addSong(song, message);

    //Tell the user
    let embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }))
        .setTitle(song.title)
        .setDescription(`**Added to queue**\n${song.duration.duration}`)
        .setURL(song.url)
        .setColor(embedColor);

    const msg = await message.channel.send(embed);

    if (msg instanceof Message) {
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
                // await addUser(iuser);

                dbUser = iuser;
            }

            AddFavorite(dbUser, song, message);
        });

        collector.on('end', collected => {
            msg.reactions.removeAll();
        });
    }
}
