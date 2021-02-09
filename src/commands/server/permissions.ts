import { Embeds } from 'discord-paginationembed';
import { GuildMember, MessageEmbed, Role, TextChannel } from 'discord.js';
import ms from 'ms';
import { ICommand } from '../../classes/Command';
import { getTargetMember } from '../../util/discordUtil';
import { sendErrorEmbed } from '../../util/styleUtil';

export const command: ICommand = {
   name: 'permissions',
   description: 'Show permissions for users and roles',
   aliases: ['perms'],
   args: false,

   async execute(message, args) {
      if (!(message.channel instanceof TextChannel)) {
         return await sendErrorEmbed(
            message,
            'This command can only be used in guild channels.'
         );
      }

      let target: Role | GuildMember

      const hasRolesFlag = args.includes('-r')

      if (!args.length) {
         target = message.member
      }
      else if (hasRolesFlag) {
         const start = args.indexOf('-r') + 1
         const query = args.slice(start, args.length).join(' ').toLowerCase()
         target = message.guild.roles.cache.find(r => r.name.toLowerCase() === query || r.id === query)
      } else {
         const query = args.join(' ').toLowerCase()
         target =
            message.mentions.roles?.first() ||
            await getTargetMember(message, query) ||
            message.guild.roles.cache.find(r => r.name.toLowerCase() === query || r.id === query)
      }

      if (!target) return await sendErrorEmbed(message, `Could not find ${hasRolesFlag ? 'Role' : 'Member'}`)

      const perms = getPerms(target);
      await createEmbed(message.channel, perms, target);
   }
};

function getPerms(target: Role | GuildMember): MessageEmbed[] {
   const perms = target.permissions.serialize(true);

   const permData = Object.entries(perms)
      .sort(p => { if (p[1]) return -1 })
      .map(p => {
         return {
            name: formatPermName(p[0]),
            value: p[1] ? 'Yes' : 'No',
            inline: true
         };
      });

   return [
      new MessageEmbed().addFields(permData.slice(0, 16)),
      new MessageEmbed().addFields(permData.slice(16))
   ];
}

async function createEmbed(
   channel: TextChannel,
   embeds: MessageEmbed[],
   target: GuildMember | Role
) {
   const avatarUrl = (target as GuildMember).user?.displayAvatarURL({ dynamic: true });

   await new Embeds()
      .setArray(embeds)
      .setChannel(channel)
      .setPageIndicator('footer')
      .setTitle('Permissions')
      .setDescription(`Permissions for ${target}`)
      .setThumbnail(avatarUrl)
      .setTimeout(ms('1h'))
      .setFooter('')
      .build();
}

function formatPermName(permName: string): string {
   return permName.charAt(0) + permName.split('_').join(' ').toLowerCase().slice(1);
}
