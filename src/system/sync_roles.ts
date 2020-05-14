import { Client, Emoji, Message, MessageReaction, ReactionEmoji, Role, TextChannel, User } from 'discord.js';

import { coders_club_id } from '../config';

const customRoles = require('../../customRoles.json');

export async function syncRoles(client: Client) {
    const guild = client.guilds.cache.get(coders_club_id);
    if (!guild) return;
    const channel = guild.channels.cache.get('618438576119742464');
    if (!channel) return;

    if (!((channel): channel is TextChannel => channel.type === 'text')(channel))
        return console.log('Couldnt find channel');

    channel.messages.fetch({ limit: 100 }).then(messages => {
        messages.map(msg => {
            if (msg.reactions.cache.size > 0) {
                msg.reactions.cache.map(rc => {
                    syncEmoji(msg, rc.emoji);
                });
            }
        });
    });

    client.on('messageReactionRemove', (reaction, user) => {
        if (
            customRoles.sections.map(section =>
                section.roles.find(role => role.reactionName === reaction.emoji.name)
            ) === false
        )
            return;

        if (user.bot) return;

        const member = guild.members.cache.get(user.id);
        const section = customRoles.sections.find(sec => sec.roles.find(rl => rl.reactionName === reaction.emoji.name));
        if (!section) return;
        const crole = section.roles.find(rl => rl.reactionName === reaction.emoji.name);
        const role = guild.roles.cache.find(rl => rl.id === crole.roleId);

        if (!member || !section || !role) return console.log('er');

        const rolesFound: Role[] = [];

        member.roles.cache.map(role => {
            if (section.roles.find(reaction => reaction.roleId === role.id)) {
                rolesFound.push(role);
            }
        });

        if (member.roles.cache.has(role.id)) {
            member.roles.remove(role);
            if (rolesFound.length === 1) member.roles.remove(section.id);
        }
    });
}

async function syncEmoji(msg: Message, emoji: Emoji | ReactionEmoji) {
    const filter = (reaction: MessageReaction, user: User) => {
        return (
            reaction.emoji.id === emoji.id &&
            !user.bot &&
            customRoles.sections.find(sec => sec.roles.find(rl => rl.reactionName === emoji.name))
        );
    };

    const collector = msg.createReactionCollector(filter);

    collector.on('collect', (reaction: MessageReaction, user: User) => {
        const member = msg.guild.members.cache.get(user.id);

        const section = customRoles.sections.find(sec => sec.roles.find(rl => rl.reactionName === reaction.emoji.name));
        if (!section) return;
        const crole = section.roles.find(rl => rl.reactionName === reaction.emoji.name);

        if (!section) return console.log('couldnt find section');
        if (!crole) return console.log('couldnt find crole');

        const role = msg.guild.roles.cache.find(rl => rl.id === crole.roleId);
        if (member) {
            if (member.roles.cache.has(role.id) === false) {
                member.roles.add(role);
                if (member.roles.cache.has(section.id) === false) member.roles.add(section.id);
            }
        }
    });
}
