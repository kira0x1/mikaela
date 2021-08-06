import { MessageEmbed } from 'discord.js';
import { Command } from '../../classes/Command';
import { createFooter, quickEmbed } from '../../util/styleUtil';
import { getTarget } from '../../util/discordUtil';

export const command: Command = {
   name: 'avatar',
   description: 'Shows the avatar of a user',
   aliases: ['av', 'avi', 'pfp', 'pic', 'icon', 'usericon', 'img', 'ava'],

   async execute(message, args) {
      // The avatar will be the user called the command by default unless the user gave
      let target = message.author;

      // If the user has entered arguments then try to search for a user that matches the given query
      if (args.length > 0) target = await getTarget(message, args.join(' '));

      // If we couldnt find a user, then tell the user, and return.
      if (!target) return quickEmbed(message, `Could not find user \`${args.join(' ')}\``);

      // Create the embed
      const embed: MessageEmbed = createFooter(message)
         .setTitle('Avatar')
         .setDescription(`Avatar of ${target}`)
         .setImage(target.displayAvatarURL({ size: 4096, dynamic: true }));

      // Send the embed
      message.channel.send({ embeds: [embed] });
   }
};
