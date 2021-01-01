import { ICommand } from '../../classes/Command';
import { GuildMember, Message, MessageEmbed, Role } from 'discord.js';
import { createFooter } from '../../util/styleUtil';

export const command: ICommand = {
   name: 'permissions',
   description: 'Show permissions for users and roles',
   aliases: ['perms'],
   args: false,

   async execute(message, args) {
      let target: Role | GuildMember = await getTarget(message, args);

      const embed = await createEmbed(message, target);

      await message.channel.send(embed);
   }
};

async function createEmbed(
   message: Message,
   target: GuildMember | Role
): Promise<MessageEmbed> {
   const embed = createFooter(message);
   embed.title = 'Permissions';
   embed.description = `Permissions for ${target}`;

   if (target instanceof GuildMember) {
      embed.setThumbnail(target.user.displayAvatarURL());
   }

   const perms = target.permissions.serialize();

   embed.addFields(
      Object.entries(perms)
         .sort((a, b) => a[0].localeCompare(b[0]))
         .map(e => {
            return {
               name: formatPermName(e[0]),
               value: e[1] ? 'Yes' : 'No',
               inline: true
            };
         })
   );

   return embed;
}

function formatPermName(permName: string): string {
   return permName.charAt(0) + permName.split('_').join(' ').toLowerCase().slice(1);
}

async function getTarget(message: Message, args: string[]): Promise<GuildMember | Role> {
   if (args.length > 0) {
      return (
         message.mentions.members?.first() ||
         message.mentions.roles?.first() ||
         (await message.guild.roles.fetch(args[0]).catch(() => undefined)) ||
         (await message.guild.members.fetch(args[0]).catch(() => undefined))
      );
   }

   return message.member;
}
