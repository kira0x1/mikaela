const chalk = require('chalk')
const logchannel = require('../config.json').channels.logs

const level = [
    log = {
        name: 'log',
        aliases: ['l', 'ok', 'green'],
        chalkcolor: chalk.green,
        color: 0x00FF00
    },
    warning = {
        name: 'warning',
        aliases: ['w', 'warn', 'yellow'],
        chalkcolor: chalk.yellow,
        color: 0xFFFF00
    },
    error = {
        name: 'error',
        aliases: ['e', 'er', 'err', 'red'],
        chalkcolor: chalk.red,
        color: 0xFF0000
    }
]

const defaultColor = 'warning'

module.exports = {
    name: 'log',
    description: 'A simpler version of logger.js',
    aliases: 'l',
    usage: '[color] [msg]',
    guildOnly: false,
    hidden: true,
    args: true,
    perms: ['admin', 'friend'],

    execute(message, args) {

        //Get color name
        const colorName = args.shift(' ')
        let description = args.join(' ')

        //Check if it matches any of the logLevels, if not then set it to 'warn' by default
        let color = level.find(lvl => lvl.name === colorName || lvl.aliases && lvl.aliases.includes(colorName))

        if (color === undefined) {
            color = level.find(lvl => lvl.name === 'error')
            description = colorName + ' ' + description
        }

        console.log(color.chalkcolor(description))
    }
}