import { Collection, Message } from 'discord.js';

import { ICommand } from '../../classes/Command';
import { getPlayer } from '../../util/musicUtil';
import { createFooter } from '../../util/styleUtil';

export const queueCalls: Collection<string, Message> = new Collection();

export const command: ICommand = {
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

    if (lastQueueCall instanceof Message) {
        queueCalls.set(message.author.id, lastQueueCall);
    }
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
        //song.duration.duration + '  ' + song.url
        embed.addField(`${i + 1}. ${song.title}`, `${song.duration.duration}  ${song.url}\n<@${song.playedBy}>\n`);
    }
    return embed;
}
