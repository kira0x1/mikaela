import { ICommand } from '../../classes/Command';
import { User } from 'discord.js';
import { sendErrorEmbed } from '../../util/styleUtil';
import { toEmbed, UserEventInfo, UserEventType } from '../../classes/UserEventInfo';

export const command: ICommand = {
   name: 'unban',
   description: 'Unban a user',
   aliases: ['unban'],
   perms: [],
   args: true,

   async execute(message, args) {
      if (!message.member?.hasPermission('BAN_MEMBERS')) {
         return sendErrorEmbed(
            message,
            `Sorry ${message.member}, you are not allowed to unban members`
         );
      }

      let user: User =
         message.mentions.users.first() ||
         (await message.client.users.fetch(args[0]).catch(_ => null));

      if (!user) {
         return sendErrorEmbed(message, `Could not find user ${args[0]}`);
      }

      const banInfo: { user: User; reason?: string } = await message.guild
         .fetchBan(user)
         .catch(_ => null);

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

      await message.channel.send(toEmbed(message, eventInfo));
   }
};
