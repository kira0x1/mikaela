import { Command } from '../../classes/Command';
import { setServerPrefix } from '../../database/api/serverApi';
import { getPrefix } from '../../util/discordUtil';
import { createFooter, successIconUrl } from '../../util/styleUtil';

export const command: Command = {
   name: 'prefix',
   description: "Set mikaela's prefix, or enter nothing to get her prefix",
   args: false,
   perms: ['mod', 'admin', 'kira'],

   async execute(message, args) {
      const arg = args.join('').trim();
      const embed = createFooter(message.author);

      if (!arg) {
         embed.setTitle(`Prefix: ${getPrefix(message)}`);
         message.channel.send({ embeds: [embed] });
         return;
      }

      await setServerPrefix(message, arg);

      embed.setTitle(`Prefix set to ${arg}`).setThumbnail(successIconUrl);

      message.channel.send({ embeds: [embed] });
   }
};
