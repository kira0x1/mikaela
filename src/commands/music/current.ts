import chalk from 'chalk';
import { MessageEmbed } from 'discord.js';
import { getPlayer } from '../../app';
import { ICommand } from '../../classes/Command';
import { msToTime } from '../../util/musicUtil';
import { embedColor, QuickEmbed } from '../../util/Style';

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

        message.channel.send(embed);
    },
};
