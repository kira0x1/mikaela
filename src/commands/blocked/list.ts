import { Command } from '../../classes/Command';
import { blockedUsers } from '../../database/models/Blocked';
import { createDeleteCollector } from '../../util/musicUtil';
import { createFooter } from '../../util/styleUtil';

export const command: Command = {
   name: 'list',
   description: 'List users blocked from using mikaela',
   aliases: ['ls'],
   perms: ['mod', 'kira'],
   isSubCommand: true,

   async execute(message, args) {
      const embed = createFooter(message);

      if (blockedUsers.size === 0) embed.setTitle('Blocked List Empty');
      else embed.setTitle(`Blocked: ${blockedUsers.size}`);

      let count = 1;
      blockedUsers.map((name, id) => {
         embed.addField(`${count}. ${name}`, `<@${id}>`);
         count++;
      });

      const msg = await message.channel.send({ embeds: [embed] });
      createDeleteCollector(msg, message);
   }
};
