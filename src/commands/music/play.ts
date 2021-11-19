import { SlashCommandStringOption } from '@discordjs/builders';
import { Message } from 'discord.js';
import { Command, instanceOfSong, Song } from '../../classes';
import { getSong, playSongFromInteraction } from '../../util';
import { getPlayer, onSongRequest } from '../../util/musicUtil';

export const command: Command = {
   name: 'play',
   description: 'Play a song',
   aliases: ['p'],
   usage: '[url | search]',
   args: false,
   interactionOptions: [
      new SlashCommandStringOption()
         .setName('song')
         .setDescription('searches youtube, and spotify for the song')
         .setRequired(true)
   ],
   hasInteraction: true,

   async execute(message: Message, args: string[]) {
      // if no arguments given then attempt to play whats in the queue
      if (args.join('').trim() === '') {
         getPlayer(message.guildId).resumeQueue(message);
         return;
      }

      // If there were arguments, then process the input and play the song
      onSongRequest(message, args, this);
   },

   async executeInteraction(interaction) {
      const value = interaction.options.data[0]?.value;

      if (!value) {
         return;
      }

      // Search for song
      const res = await getSong(value.toString(), true);

      if (!res) {
         interaction.reply(`Song: ${value} not found`);
         return;
      }

      let song: Song;

      if (res instanceof Array) {
         song = res[0];
      } else if (instanceOfSong(res)) {
         song = res;
      }

      playSongFromInteraction(interaction, song);
   }
};
