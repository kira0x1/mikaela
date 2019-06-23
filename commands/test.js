const ct = require('common-tags')
const log = require('./log.js')

module.exports = {
    name: 'test',
    description: 'test command',
    aliases: ['t', 'ts'],
    usage: '',
    args: false,
    guildOnly: false,
    cooldown: 5,
    perms: ['admin', 'friend'],

    execute(message, args) {

        // log.execute(message, ['warn', 'Test :D'])

        let reply = ct.stripIndent`
            Hello <@${message.author.id}>
            This is a test command!.
            Everything seems to be working fine :smile:       
        `

        message.channel.send(reply)
    }
}