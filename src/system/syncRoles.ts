import { Client, Emoji, Message, MessageReaction, ReactionEmoji, Role, TextChannel, User } from 'discord.js';
import { logger } from '../app';
import { coders_club_id } from '../config';



const customRoles = require('../../customRoles.json');

export async function syncRoles(client: Client) {
  const guild = client.guilds.cache.get(coders_club_id);
  if (!guild) return;
  const channel = guild.channels.cache.get('618438576119742464');
  if (!channel) return;

  if (!((channel): channel is TextChannel => channel.type === 'text')(channel))
    return logger.log('info','Couldnt find channel');

  channel.messages.fetch({ limit: 100 }).then(messages => {
    messages.map(msg => {
       msg.reactions.cache.map(rc => {
         syncEmoji(msg, rc.emoji);
       });
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
    const section = getSection(reaction)
    if (!section) return;
    const crole = section.roles.find(rl => rl.reactionName === reaction.emoji.name);
    const role = guild.roles.cache.find(rl => rl.id === crole.roleId);

    if (!member || !section || !role) return logger.log('info','er');

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

    const section = getSection(reaction)

    if (!section) return;
    const crole = section.roles.find(rl => rl.reactionName === reaction.emoji.name);

    if (!section) return logger.log('info','couldnt find section');
    if (!crole) return logger.log('info','couldnt find crole');

    const role = msg.guild.roles.cache.find(rl => rl.id === crole.roleId);
    if (!member) return

    if (member.roles.cache.has(role.id) === false)
      member.roles.add(role);


    if (member.roles.cache.has(section.id) === false)
      member.roles.add(section.id);
  });
}

function getSection(reaction) {
  return customRoles.sections.find(sec => sec.roles.find(rl => rl.reactionName === reaction.emoji.name));
}
