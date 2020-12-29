import { ICommand } from '../../classes/Command';
import { GuildMember, User } from 'discord.js';
import { sendErrorEmbed } from '../../util/styleUtil';
import { toEmbed, UserEventInfo, UserEventType } from '../../classes/UserEventInfo';

export const command: ICommand = {
   name: 'ban',
   description: 'Ban a user',
   aliases: ['ban'],
   perms: [],
   args: true,
   userPerms: ['BAN_MEMBERS'],
   botPerms: ['BAN_MEMBERS'],

   async execute(message, args) {
      let user: User =
         message.mentions.users?.first() ||
         (await message.client.users.fetch(args[0]).catch(_ => null));

      if (!user) {
         return sendErrorEmbed(message, `Could not find user ${args[0]}`);
      }

      if (user instanceof GuildMember && !user.bannable) {
         return sendErrorEmbed(message, `Cannot kick ${user}`);
      }

      const banInfo = await message.guild.fetchBan(user).catch(_ => {
         return null;
      });
      if (banInfo) {
         return sendErrorEmbed(message, `${user} is already banned`);
      }

      const deleteMessageDays = +args.slice(-1) || 0;

      if (deleteMessageDays < 0 || deleteMessageDays > 7) {
         return sendErrorEmbed(
            message,
            `Can only delete messages between 0 and 7 days, was ${deleteMessageDays}`
         );
      }

      const reason = args.slice(1, -1).join(' ');

      await message.guild.members.ban(user, {
         reason: reason,
         days: deleteMessageDays
      });

      let eventInfo: UserEventInfo = {
         type: UserEventType.Ban,
         issuer: message.author,
         receiver: user,
         deleteMessageDays: deleteMessageDays,
         reason: reason
      };

      await message.channel.send(toEmbed(message, eventInfo));
   }
};
