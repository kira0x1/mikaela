import { Command } from '../../classes/Command';
import { User } from 'discord.js';
import { sendErrorEmbed } from '../../util/styleUtil';
import { toEmbed, UserEventInfo, UserEventType } from '../../classes/UserEventInfo';
import { getTargetMember } from '../../util/discordUtil';

export const command: Command = {
   name: 'ban',
   description: 'Ban a user',
   aliases: ['ban'],
   args: true,
   userPerms: ['BAN_MEMBERS'],
   botPerms: ['BAN_MEMBERS'],

   async execute(message, args) {
      const member = await getTargetMember(message, args[0]);

      if (!member) {
         return sendErrorEmbed(message, `Could not find user ${args[0]}`);
      }

      if (!member.bannable) {
         return sendErrorEmbed(message, `Cannot kick ${member}`);
      }

      const banInfo: { user: User; reason?: string } = await message.guild.bans.fetch(member);

      if (banInfo) {
         return sendErrorEmbed(message, `${member} is already banned`);
      }

      const deleteMessageDays = Number(args.slice(-1)) || 0;

      if (deleteMessageDays < 0 || deleteMessageDays > 7) {
         return sendErrorEmbed(
            message,
            `Can only delete messages between 0 and 7 days, was ${deleteMessageDays}`
         );
      }

      const reason = args.slice(1, -1).join(' ');

      await message.guild.members.ban(member, {
         reason: reason,
         days: deleteMessageDays
      });

      let eventInfo: UserEventInfo = {
         type: UserEventType.Ban,
         issuer: message.author,
         receiver: member.user,
         deleteMessageDays: deleteMessageDays,
         reason: reason
      };

      await message.channel.send({ embeds: [toEmbed(message, eventInfo)] });
   }
};
