import { Message } from 'discord.js';
import { ICommand } from '../../classes/Command';
import { AddBlocked, blockedUsers } from '../../db/dbBlocked';
import { getTarget } from '../../util/musicUtil';
import { createFooter, QuickEmbed } from '../../util/styleUtil';

export const command: ICommand = {
   name: 'Block',
   description: 'Block user from using the bot',
   aliases: ['blocked', 'bl'],
   perms: ['admin'],
   args: true,

   async execute(message, args) {
      if (args[0] === '--list') {
         listBlocked(message);
         return;
      }

      const query = args.join(' ');
      const target = await getTarget(message, query);
      if (!target.id) return QuickEmbed(message, `Member \"${query}\"`);

      if (blockedUsers.includes(target.id))
         return QuickEmbed(message, `Member \"${target.tag}\" is already blocked`);

      AddBlocked(target.id)
         .then(() => QuickEmbed(message, `Blocked: ${target.tag}`))
         .catch(err => {
            QuickEmbed(message, 'Error while blocking a user');
            console.error(err);
         });
   }
};

function listBlocked(message: Message) {
   const embed = createFooter(message);

   if (blockedUsers.length === 0) embed.setTitle('Blocked List Empty');
   else embed.setTitle(`Blocked: ${blockedUsers.length}`);

   let desc = '';

   blockedUsers.map(id => {
      desc += `${id}\n`;
   });

   embed.setDescription(desc);

   message.channel.send(embed);
}
