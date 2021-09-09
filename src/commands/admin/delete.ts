import { Constants } from 'discord.js';
import { logger } from '../../app';
import { Command } from '../../classes/Command';
import { addCodeField, createFooter, errorIconUrl, successIconUrl } from '../../util/styleUtil';

export const command: Command = {
   name: 'delete',
   description: 'Deletes messages',
   usage: '[amount]',
   aliases: ['d'],
   perms: ['admin'],
   hidden: true,

   async execute(message, args) {
      if (message.author.id !== '177016697117474816') {
         message.author.send('You do not have permission to use this command');
         return;
      }

      let amount = 2;
      args.find(arg => {
         if (Number(arg)) {
            amount = Number(arg) + 1;
         }
      });

      // If the channel is not a text channel then we cant bulkdelete so return
      if (message.channel.type !== 'text') return;
      const author = message.author;

      try {
         const messagesDeleted = await (await message.channel.bulkDelete(amount)).array().reverse();
         if (!messagesDeleted) return;

         const embed = createFooter(message)
            .setTitle(`${author.username} deleted ${messagesDeleted.length} messages`)
            .addField(`Guild`, message.guild.name, true)
            .addField(`Channel`, message.channel.name, true)
            .setThumbnail(successIconUrl);

         let deletedMessagesPretty = '';

         for (let i = 1; i < messagesDeleted.length; i++) {
            const msg = messagesDeleted[i];
            deletedMessagesPretty += `(${i})\nAuthor: ${msg.author.username}\ncontent: ${msg.content}\n\n`;
         }

         addCodeField(embed, deletedMessagesPretty);
         author.send(embed);
      } catch (error: any) {
         if (error.code === Constants.APIErrors.UNKNOWN_MESSAGE) return;
         logger.error(error);

         const embed = createFooter(message)
            .setTitle(`Error`)
            .setDescription(error.message)
            .addField(`Command`, 'delete')
            .addField(`Guild`, message.guild.name)
            .addField(`Channel`, message.channel.name)
            .setThumbnail(errorIconUrl);

         addCodeField(embed, error.message);

         author.send(embed);
      }
   }
};
