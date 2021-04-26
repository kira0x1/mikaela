import { Collection, Message } from 'discord.js';

import { Command } from '../../classes/Command';
import { createDeleteCollector, getPlayer } from '../../util/musicUtil';
import { createFooter } from '../../util/styleUtil';

export const queueCalls: Collection<string, Message> = new Collection();

export const command: Command = {
    name: 'Queue',
    description: 'Displays the queue',
    aliases: ['q'],

    async execute(message, args) {
        sendQueueEmbed(message)
    }
};

export async function sendQueueEmbed(message: Message) {
    const embed = await getQueue(message);
    const lastQueueCall = await message.channel.send(embed);
    queueCalls.set(message.author.id, lastQueueCall);
    createDeleteCollector(lastQueueCall, message)
}

export async function getQueue(message: Message) {
    //Get the guilds player
    const player = getPlayer(message);

    if (!player) return;

    //Create embed
    const embed = createFooter(message)

    //If the player is playing a song add it to the top of the embed
    if (player.currentlyPlaying) {
        let currentlyPlaying = player.currentlyPlaying;
        const songBar = await player.getProgressBar()

        embed.setTitle(`Playing: ${currentlyPlaying.title}`);
        embed.setURL(currentlyPlaying.url);
        embed.addField(`**${player.getDurationPretty()}**\n${songBar}`, `<@${player.currentlyPlaying.playedBy}>`)
    } else {
        //If no song is currently playing
        embed.setTitle('No currently playing song');
    }

    const songs = player.getSongs()

    //Add songs to the embed
    for (let i = 0; i < songs.length && i < 25; i++) {
        const song = songs[i]
        embed.addField(`${i + 1}. ${song.title}`, `${song.duration.duration}  ${song.url}\n<@${song.playedBy}>\n`);
    }

    return embed;
}
