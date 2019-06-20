const ct = require('common-tags')

module.exports = {
    name: 'test',
    description: 'test command',
    aliases: ['t', 'ts'],
    usage: '',
    args: false,
    guildOnly: false,
    cooldown: 1,

    execute(message, args) {

        let reply = ct.stripIndent`
            Hello <@${message.author.id}>
            This is a test command!.
            Everything seems to be working fine :smile:       
        `

        message.channel.send(reply)
    }
}