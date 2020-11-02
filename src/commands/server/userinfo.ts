import { ICommand } from '../../classes/Command';
import { getTargetMember } from '../../util/musicUtil';
import { createFooter, QuickEmbed } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'userinfo',
    description: 'Shows information of a user',
    aliases: ['info', 'user'],

    async execute(message, args) {
        const target = args.length > 0 ?
            await getTargetMember(message, args.join(' ')) :
            message.member;

        if (!target) return QuickEmbed(message, `Could not find user \`${args.join(' ')}\``)

        const embed = createFooter(message)
            .setTitle('User info')
            .setDescription(`User info for ${target}`)
            .setThumbnail(target.user.avatarURL({ dynamic: true, size: 4096 }))
            .addField('User ID', `\`${target.id}\``)
            .addField('Created at', target.user.createdAt.toUTCString())
            .addField('Joined at', target.joinedAt.toUTCString());

        message.channel.send(embed);
    }
};
