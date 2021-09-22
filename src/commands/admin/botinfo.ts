import { Command } from '../../classes/Command';
import { addCodeField, createFooter } from '../../util/styleUtil';

export const command: Command = {
   name: 'BotInfo',
   description: 'Display bot info and stats',
   perms: ['kira'],

   execute(message, args) {
      const guilds = message.client.guilds.cache;
      const embed = createFooter(message).setTitle(`Info\nServers: ${guilds.size}`);

      addCodeField(embed, '---Servers---\n\n' + guilds.array().join('\n'));
      message.channel.send(embed);
   }
};
