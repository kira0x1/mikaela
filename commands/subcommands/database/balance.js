const currency = require('./currency')
module.exports = {
    name: 'balance',
    aliases: ['b'],
    usage: 'optional: <user>',
    description: 'Display user\'s balance',

    execute(message, args) {
        const target = message.mentions.users.first() || message.author
        return message.channel.send(`User: **${target.tag}** has ***${currency.getBalance(target.id)} g***`)
    }
}