import { Client, TextChannel, Emoji, ReactionEmoji, MessageReaction, User, Message, Role, RichEmbed } from 'discord.js';
import { coders_club_id } from '../config';

const customRoles = require('../../customRoles.json')

export async function syncRoles(client: Client) {
    const guild = client.guilds.get(coders_club_id)
    if (!guild) return
    const channel = guild.channels.get("618438576119742464")
    if (!channel) return

    if (!((channel): channel is TextChannel => channel.type === "text")(channel)) return console.log("Couldnt find channel")

    channel.fetchMessages({ limit: 50 }).then(messages => {
        messages.map(msg => {
            if (msg.reactions.size > 0) {
                msg.reactions.map(rc => {
                    syncEmoji(msg, rc.emoji)
                })
            }
        })
    })

    client.on("messageReactionRemove", (reaction, user) => {
        if (customRoles.sections.map(section => section.roles.find(role => role.reactionName === reaction.emoji.name)) === false) return
        if (user.bot) return

        const member = guild.members.get(user.id)
        const section = customRoles.sections.find(sec => sec.roles.find(rl => rl.reactionName === reaction.emoji.name))
        if (!section) return
        const crole = section.roles.find(rl => rl.reactionName === reaction.emoji.name)
        const role = guild.roles.find(rl => rl.id === crole.roleId)

        if (!member || !section || !role) return console.log("er")

        const rolesFound: Role[] = []

        member.roles.map(role => {
            if (section.roles.find(r => r.roleId === role.id)) {
                rolesFound.push(role)
            }
        })

        if (member.roles.has(role.id)) {
            member.removeRole(role)
            if (rolesFound.length === 1)
                member.removeRole(section.id)
        }
    })
}

async function syncEmoji(msg: Message, emoji: Emoji | ReactionEmoji) {
    const filter = (reaction: MessageReaction, user: User) => {
        return reaction.emoji.id === emoji.id && !user.bot && customRoles.sections.find(sec => sec.roles.find(rl => rl.reactionName === emoji.name));
    };

    const collector = msg.createReactionCollector(filter)

    collector.on("collect", r => {
        const user = r.users.last()
        const member = msg.guild.members.get(user.id)

        const section = customRoles.sections.find(sec => sec.roles.find(rl => rl.reactionName === r.emoji.name))
        if (!section) return
        const crole = section.roles.find(rl => rl.reactionName === r.emoji.name)

        if (!section) return console.log("couldnt find section")
        if (!crole) return console.log("couldnt find crole")

        const role = msg.guild.roles.find(rl => rl.id === crole.roleId)
        if (member) {
            if (member.roles.has(role.id) === false) {
                member.addRole(role)
                if (member.roles.has(section.id) === false)
                    member.addRole(section.id)
            }
        }
    })
}