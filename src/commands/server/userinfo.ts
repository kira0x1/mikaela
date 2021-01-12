import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { ICommand } from '../../classes/Command';
import { createFooter, QuickEmbed } from '../../util/styleUtil';
import { getTargetMember } from '../../util/discordUtil';

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

      const embed = await createEmbed(message, target);
      message.channel.send(embed);
   }
};

async function createEmbed(message: Message, target: GuildMember): Promise<MessageEmbed> {
   const embed = createFooter(message)
      .setTitle('User info')
      .setDescription(`User info for ${target}`)
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
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

   return embed;
}

async function getPreviousNicks(member: GuildMember): Promise<string[]> {
   const auditLogs = await member.guild.fetchAuditLogs({
      type: 'MEMBER_UPDATE'
   });

   return auditLogs.entries
      .filter(e => e.target == member.user && e.changes.some(c => c.key == 'nick'))
      .map(e => e.changes[0])
      .flatMap(c => [c.old, c.new].filter(c => c !== undefined));
}
