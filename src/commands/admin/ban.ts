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

   async execute(message, args) {
      if (!message.member?.hasPermission('BAN_MEMBERS')) {
         return sendErrorEmbed(
            message,
            `Sorry ${message.member}, you are not allowed to ban members`
         );
      }

      let user: User | GuildMember =
         message.mentions.members?.first() ||
         message.guild.member(args[0]) ||
         (await message.client.users.fetch(args[0]).catch(_ => {
            return null;
         }));

      if (!user) {
         return sendErrorEmbed(message, `Could not find user ${args[0]}`);
      }

      if (user instanceof GuildMember && !user.bannable) {
         return sendErrorEmbed(message, `Cannot kick ${user}`);
      }

      const deleteMessageDays = +args[1] || 0;
      const reason = args.slice(2).join(' ');

      if (deleteMessageDays < 0 || deleteMessageDays > 7) {
         return sendErrorEmbed(
            message,
            `Can only delete messages between 0 and 7 days, was ${deleteMessageDays}`
         );
      }

      await message.guild.members.ban(user, {
         reason: reason,
         days: deleteMessageDays
      });

      let a = user instanceof User ? user : user.user;

      let eventInfo: UserEventInfo = {
         type: UserEventType.Ban,
         issuer: message.author,
         receiver: a,
         timestamp: new Date(),
         reason: reason,
         deleteMessageDays: deleteMessageDays
      };

      await message.channel.send(toEmbed(message, eventInfo));
   }
};
