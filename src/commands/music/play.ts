import { Message } from 'discord.js';
import { ICommand } from '../../classes/Command';
import { onSongRequest } from '../../util/musicUtil';

export const command: ICommand = {
   name: 'play',
   description: 'Play a song',
   aliases: ['p'],
   usage: '[url | search]',
   args: false,

   async execute(message: Message, args: string[]) {
      onSongRequest(message, args, this);
   }
};
