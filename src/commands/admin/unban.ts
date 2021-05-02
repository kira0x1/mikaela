import { Command } from '../../classes/Command';
import { User } from 'discord.js';
import { sendErrorEmbed } from '../../util/styleUtil';
import { toEmbed, UserEventInfo, UserEventType } from '../../classes/UserEventInfo';
import { getTarget } from '../../util/discordUtil';

export const command: Command = {
   name: 'unban',
   description: 'Unban a user',
   aliases: ['unban'],
   args: true,
   userPerms: ['BAN_MEMBERS'],
   botPerms: ['BAN_MEMBERS'],

   async execute(message, args) {
      const user = await getTarget(message, args[0]);

      if (!user) {
         return sendErrorEmbed(message, `Could not find user ${args[0]}`);
      }

      const banInfo: { user: User; reason?: string } = await message.guild.fetchBan(user);

      if (!banInfo) {
         return sendErrorEmbed(message, `${user} is not banned`);
      }

      const reason = args.slice(1).join(' ');

      await message.guild.members.unban(user, reason);

      let eventInfo: UserEventInfo = {
         type: UserEventType.Unban,
         issuer: message.author,
         receiver: user,
         reason: reason
      };

      message.channel.send(toEmbed(message, eventInfo));
   }
};
