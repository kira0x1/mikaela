import { MessageEmbed } from 'discord.js';
import { Command } from '../../classes/Command';
import { createFooter } from '../../util/styleUtil';

export const command: Command = {
   name: 'servericon',
   description: 'Shows the icon of the current server',
   aliases: ['guildicon', 'srvicon'],

   execute(message, args) {
      const guild = message.guild;
      let embed: MessageEmbed = createFooter(message.author)
         .setTitle('Server icon')
         .setDescription(`Server icon for ${guild}`)
         .setImage(guild.iconURL({ dynamic: true }));

      message.channel.send({ embeds: [embed] });
   }
};
