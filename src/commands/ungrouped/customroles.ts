import { ICommand } from '../../classes/Command';
import { Message, RichEmbed, Emoji, VoiceChannel, TextChannel, MessageReaction, User, Role } from 'discord.js';
import chalk from 'chalk';
import { embedColor } from '../../util/style';
const customRoles = require('../../../customRoles.json')

export const command: ICommand = {
    name: "custom-roles",
    description: "setup for custom roles",
    aliases: ["cr"],
    hidden: true,
    perms: ["admin"],

    async execute(message, args) {
        const sections = customRoles.sections

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i]

            const embedTitle = new RichEmbed()
            embedTitle.setColor(embedColor)
            embedTitle.setTitle("\n\n" + section.name)
            message.channel.send(embedTitle)



            const embed = new RichEmbed()
            embed.setColor(embedColor)

            for (let i = 0; i < section.roles.length; i++) {
                const role = section.roles[i]

                const guildRole = findRole(message, role.roleId)
                if (!guildRole) return console.log(chalk.bgRed(`could not find guild role ${role.roleId}`))

                const emoji = findEmoji(message, role.reactionName)
                if (!emoji) return console.log(chalk.bgRed(`could not find emoji ${role.reactionId}`))

                let content = emoji.toString()
                if (i < section.roles.length - 1) {
                    content += "\n\u200b"
                }

                embed.addField(`**${role.name}**`, content, true)
            }

            const msg = await message.channel.send(embed)
            if (msg instanceof Message) {
                for (let r = 0; r < section.roles.length; r++) {
                    const emoji = findEmoji(msg, section.roles[r].reactionName)
                    if (emoji) {
                        await msg.react(emoji)
                        const role = msg.guild.roles.get(section.roles[r].roleId)
                        if (role) {
                            const sectionRole = msg.guild.roles.get(section.id)
                            if (!sectionRole) return console.log("couldnt find section role")
                            addCollector(msg, emoji, role, sectionRole)
                        }
                        else {
                            console.log("role not found")
                        }
                    }
                }
            }
        }
    }
}


function addCollector(message: Message, emoji: Emoji, role: Role, sectionRole: Role) {
    const filter = (reaction: MessageReaction, user: User) => {
        return reaction.emoji === emoji && !user.bot;
    };

    const collector = message.createReactionCollector(filter)

    collector.on("collect", async (reaction) => {
        const user = reaction.users.last();

        const member = message.guild.members.get(user.id);
        if (!member) return console.log("couldnt find member")

        if (!role)
            return console.log(chalk.bgRed.bold("role undefined"));

        console.log(chalk.bgGreen.bold(`Added role from user ${user.username}`))
        member.addRole(role);
        member.addRole(sectionRole)
    })

    message.guild.client.on('messageReactionRemove', (reaction: MessageReaction, user: User) => {
        const member = message.guild.members.get(user.id);
        if (!member) return console.log("couldnt find member")

        if (reaction.message.id === message.id && user.bot === false && reaction.emoji === emoji) {
            if (member.roles.find(rl => rl.id === role.id)) {
                console.log(chalk.bgMagenta.bold(`Removed role from user ${user.username}`))
                member.removeRole(role);
                member.removeRole(sectionRole)
            }
        }
    })
}
function react(message: Message, emoji: Emoji) {
    message.react(emoji)
}

function findRole(message: Message, id: string) {
    let client = message.client
    const guild = client.guilds.get("585850878532124672")
    if (!guild) return

    return guild.roles.find(role => role.id === id)
}

function findEmoji(message: Message, name: string) {
    let client = message.client
    const guild = client.guilds.get("585850878532124672")
    if (!guild) return
    return guild.emojis.find(em => em.name === name)
}