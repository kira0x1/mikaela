const { neko } = require('../util/util')

module.exports = {
    name: 'lolice',
    aliases: ['loli'],
    description: ['lolifi someone uwu'],
    args: true,
    guildOnly: true,

    execute(message, args) {
        let img = args[0]

        let user1 = message.mentions.users.first()

        if (user1) {
            img = user1.avatarURL
        }

        let params = { url: img }

        neko('lolice', params, message)
    }
}