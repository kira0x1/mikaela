const { kira } = require('../config.json').users
const discord = require('discord.js')

module.exports = {
    name: 'dm',
    description: 'used to dm people',
    usage: '[username | id] [message]',
    args: true,
    guildOnly: false,
    hidden: true,
    perms: ['admin'],

    execute(message, args) {
        message.client.fetchUser(kira).then(user => {
            let msg = args.join(' ')
            const embed = new discord.RichEmbed()
                .setAuthor(`From: ${message.author.tag}`, message.author.avatarURL)
                .addField('message', msg, false)
                .addBlankField(true)
                .setTimestamp()
            user.send(embed)
        })
    }
}