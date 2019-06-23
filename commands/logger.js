const ct = require('common-tags')
const chalk = require('chalk')
const logchannel = require('../config.json').channels.logs
const kira = require('../config.json').users.kira
const discord = require('discord.js')

let replyLog = true
let dmLog = true

const level = [
    log = {
        name: 'log',
        aliases: ['l'],
        chalkcolor: chalk.green,
        color: 0x00FF00
    },
    warning = {
        name: 'warning',
        aliases: ['warn'],
        chalkcolor: chalk.yellow,
        color: 0xFFFF00
    },
    error = {
        name: 'error',
        aliases: ['e', 'er', 'err'],
        chalkcolor: chalk.red,
        color: 0xFF0000
    }
]

const subcommands = [
    dm = {
        name: 'dm',
        description: 'Set dm to user',
        usage: '<true|false>'
    }
]

const flagPrefix = '-'

module.exports = {
    name: 'logger',
    description: ct.stripIndents`
    Handles logging to the console,
    and dming logs to the admin.
    `,
    guildOnly: false,
    args: true,
    cooldown: 0.1,
    hidden: true,
    usage: ct.stripIndents`
    [Message] <Log-Level> ${level.map(lvl => '\n\n' + lvl.name + '\nAliases [' + lvl.aliases + ']') + '\n'}`,
    perms: ['admin','friend'],


    execute(message, args) {

        const user = message.author
        const colorName = args.shift(' ')
        let description = args.join(' ')
        
        //Check if it matches any of the logLevels, if not then set it to 'warn' by default
        let color = level.find(lvl => lvl.name === colorName || lvl.aliases && lvl.aliases.includes(colorName))

        if (color === undefined) {
            color = level.find(lvl => lvl.name === 'error')
            description = colorName + ' ' + description
        }

        console.log(color.chalkcolor(description))

        if (!replyLog || !dmLog) return

        //Create embed
        const embedlog = new discord.RichEmbed()
            .setTitle(color.name)
            .setColor(color.color)
            .setDescription(`${description}`)
            .setTimestamp()

        //Reply to the author
        if (replyLog) {
            message.channel.send(embedlog)
        }

        //dm the admin
        if (dmLog) {
            message.client.fetchUser(kira).then(user => {
                user.send(embedlog)
            }).catch(error => {
                console.error(error)
            })
        }

        //Send to Debug-Logs channel
        message.client.channels.get(logchannel).send(embedlog, { reply: kira })
    }
}