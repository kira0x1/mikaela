import { MessageEmbed } from 'discord.js';
import { Command } from '../../classes/Command';
import { getTarget } from '../../util/discordUtil';
import { createFooter, quickEmbed } from '../../util/styleUtil';

export const command: Command = {
   name: 'banner',
   description: 'Shows the banner of a user',

   async execute(message, args) {
      // The avatar will be the user called the command by default unless the user gave
      let target = message.author;

      // If the user has entered arguments then try to search for a user that matches the given query
      if (args.length > 0) target = await getTarget(message, args.join(' '));

      // If we couldnt find a user, then tell the user, and return.
      if (!target) return quickEmbed(message, `Could not find user \`${args.join(' ')}\``);

      // force fetch user or getting banner will throw an error
      target = await target.fetch(true);

      const banner = target.bannerURL({ dynamic: true, size: 4096 });

      // Create the embed
      const embed: MessageEmbed = createFooter(message.author).setTitle('Banner');

      if (!banner) {
         embed.setDescription(`${target} does not have a banner`);
      } else {
         embed.setDescription(`Banner of ${target}`).setImage(banner);
      }

      // Send the embed
      message.channel.send({ embeds: [embed] });
   }
};
