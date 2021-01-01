import { ICommand } from '../../classes/Command';
import { Role, GuildMember, Message, MessageEmbed } from 'discord.js';
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

async function createEmbed(message: Message, target: GuildMember | Role): Promise<MessageEmbed> {
   const embed = createFooter(message);
   embed.title = 'Permissions';
   embed.description = `Permissions for ${target}`;

   if (target instanceof GuildMember) {
      embed.setThumbnail(target.user.displayAvatarURL());
   }

   const perms = target.permissions.serialize();

   for (const perm in perms) {
      if (perms.hasOwnProperty(perm)) {
         const permName = perm
            .charAt(0)
            .concat(perm.split('_').join(' ').slice(1).toLowerCase());
         embed.addField(permName, perms[perm], true);
      }
   }

   return embed;
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
