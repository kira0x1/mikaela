import { Message } from 'discord.js';
import { Command } from '../../classes/Command';
import { onSongRequest, getPlayer } from '../../util/musicUtil';

export const command: Command = {
   name: 'play',
   description: 'Play a song',
   aliases: ['p'],
   usage: '[url | search]',
   args: false,

   async execute(message: Message, args: string[]) {
      // if no arguments given then attempt to play whats in the queue
      if (args.join('').trim() === '') {
         getPlayer(message).resumeQueue(message);
         return;
      }

      // If there were arguments, then process the input and play the song
      onSongRequest(message, args, this);
   }
};
