const { neko } = require('../util/util')

module.exports = {
    name: 'trash',
    description: 'Trash waifu',
    usage: '<mention-user or image-url>',
    guildOnly: true,
    args: true,

    execute(message, args) {
        let waifuImage = args[0]

        const user = message.mentions.users.first()
        if (user)
            waifuImage = user.avatarURL


        let query = {
            url: waifuImage
        }

        neko('trash', query, message);
    }
}