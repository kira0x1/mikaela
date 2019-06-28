const { usage, neko } = require('../util/util')

module.exports = {
    name: 'magik',
    aliases: ['magic', 'm'],
    description: 'Magikfy stuff :<',
    usage: '<image> <magik intensity>',
    args: true,
    guildOnly: true,

    execute(message, args) {
        if (args.length !== 2) {
            return message.reply(usage(this))
        }

        let img = args[0]

        let user1 = message.mentions.users.first()
        if (user1) {
             img = user1.avatarURL
        }
        let params = { image: img, intensity: args[1] }

        neko('magik', params, message)
    }
}