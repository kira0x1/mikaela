const { usage, neko } = require('../util/util')

module.exports = {
    name: 'magik',
    aliases: ['magic', 'm'],
    description: 'Magikfy stuff :<',
    usage: '<image> <intensity>',
    args: true,
    guildOnly: true,

    execute(message, args) {
        let img = args[0]
        let intensity = args[1]

        if (intensity === undefined) {
            intensity = 3
        }
        else if (isNaN(intensity)) {
            return message.reply(usage(this))
        }else if(intensity < 1 || intensity > 10){
            return message.reply('`Intensity must be between 1 - 10`')
        }

        let user1 = message.mentions.users.first()
        if (user1) {
            img = user1.avatarURL
        }
        let params = { image: img, intensity: intensity }

        neko('magik', params, message)
    }
}