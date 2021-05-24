import chalk from 'chalk';
import { Message } from 'discord.js';

import { logger } from '../../app';
import { Command } from '../../classes/Command';
import { findOrCreate } from '../../database/api/userApi';
import { getSong, sendSongNotFoundEmbed } from '../../util/apiUtil';
import { quickEmbed } from '../../util/styleUtil';

export const command: Command = {
   name: 'remove',
   description: 'Remove a song from your favorites',
   aliases: ['delete', 'rem'],
   usage: '[Position | Search]',
   cooldown: 1.5,
   isSubCommand: true,

   async execute(message, args) {
      if (Number(args[0])) RemoveByIndex(args, message);
      else RemoveBySearch(args.join(' '), message);
   }
};

async function RemoveByIndex(args: string[], message: Message) {
   const index = Number(args.shift());
   if (!index) return;

   const user = await findOrCreate(message.author);

   if (index > user.favorites.length) {
      return quickEmbed(message, 'Invalid position');
   }

   const song = user.favorites.splice(index - 1, 1).shift();
   user.save();

   if (!song) {
      return quickEmbed(message, `Error while trying to remove song at ${index}`);
   }

   quickEmbed(message, `Removed song **${song.title}** from your favorites`);
}

async function RemoveBySearch(query: string, message: Message) {
   logger.info(chalk.bgRed.bold(`Removing by search: ${query}`));
   const user = await findOrCreate(message.author);
   const song = await getSong(query);
   if (song instanceof Array) return;

   if (!song) {
      return sendSongNotFoundEmbed(message, query);
   }

   let hasRemovedSong = false;

   for (let i = 0; i < user.favorites.length; i++) {
      const s = user.favorites[i];
      if (s.id !== song.id) continue;

      const songRemoved = user.favorites.splice(i, 1).shift();
      if (!songRemoved) return quickEmbed(message, `Error while trying to remove song at ${i}`);
      logger.info(chalk.bgGreen.bold(`Deleting song ${s.title}`));
      user.save();
      hasRemovedSong = true;
      break;
   }

   if (hasRemovedSong)
      quickEmbed(message, `Removed song **${song.title}** from your favorites`, { addFooter: true });
   else sendSongNotFoundEmbed(message, query);
}
