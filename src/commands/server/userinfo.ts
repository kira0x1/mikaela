import { ICommand } from '../../classes/Command';
import { getTargetMember } from '../../util/musicUtil';
import { createFooter, QuickEmbed } from '../../util/styleUtil';
import { GuildMember } from 'discord.js';

export const command: ICommand = {
   name: 'userinfo',
   description: 'Shows information of a user',
   aliases: ['info', 'user', 'uinfo'],

   async execute(message, args) {
      const target =
         args.length > 0
            ? await getTargetMember(message, args.join(' '))
            : message.member;

      if (!target)
         return QuickEmbed(message, `Could not find user \`${args.join(' ')}\``);

      const embed = createFooter(message)
         .setTitle('User info')
         .setDescription(`User info for ${target}`)
         .setThumbnail(target.user.avatarURL({ dynamic: true, size: 4096 }))
         .addField('User ID', `\`${target.id}\``)
         .addField('Created at', target.user.createdAt.toUTCString())
         .addField('Joined at', target.joinedAt.toUTCString());

      if (
         message.guild.me.hasPermission('VIEW_AUDIT_LOG') &&
         message.member.hasPermission('VIEW_AUDIT_LOG')
      ) {
         const previousNicks = await getPreviousNicks(target);

         if (previousNicks.length > 0) {
            embed.addField('Previous nicknames', previousNicks.join(', '));
         }
      }

      message.channel.send(embed);
   }
};

async function getPreviousNicks(member: GuildMember): Promise<string[]> {
   return await member.guild
      .fetchAuditLogs({
         type: 'MEMBER_UPDATE'
      })
      .then(audit =>
         audit.entries
            .filter(e => e.target == member.user && e.changes.some(e => e.key == 'nick'))
            .map(e => e.changes)
            .flatMap(e => [e[0].old, e[0].new].filter(e => e !== undefined))
      );
}
