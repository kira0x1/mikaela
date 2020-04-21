import { Collection, Message, MessageEmbed } from 'discord.js';

import { getPlayer } from '../../app';
import { ICommand } from '../../classes/Command';
import { embedColor } from '../../util/Style';

export const queueCalls: Collection<string, Message> = new Collection();

export const command: ICommand = {
    name: 'Queue',
    description: 'Displays the queue',
    aliases: ['q'],

    async execute(message, args) {
        const embed = getQueue(message);
        const lastQueueCall = await message.channel.send(embed);

        if (lastQueueCall instanceof Message) {
            queueCalls.set(message.author.id, lastQueueCall);
        }
    },
};

export function getQueue(message: Message) {
    //Get the guilds player
    const player = getPlayer(message);

    if (!player) return;

    //Create embed
    const embed = new MessageEmbed();
    embed.setColor(embedColor);

    //If the player is playing a song add it to the top of the embed
    if (player.currentlyPlaying) {
        let currentlyPlaying = player.currentlyPlaying;
        embed.setTitle('Playing: ' + currentlyPlaying.title);
        embed.setURL(currentlyPlaying.url);
        embed.setDescription(currentlyPlaying.duration.duration);
    } else {
        //If no song is currently playing
        embed.setTitle('No currently playing song');
    }

    //Add songs to the embed
    for (let i = 0; i < player.queue.songs.length && i < 25; i++) {
        const song = player.queue.songs[i];
        embed.addField(`${i + 1}. ${song.title}`, song.duration.duration + '  ' + song.url);
    }
    return embed;
}
