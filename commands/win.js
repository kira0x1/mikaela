const { neko, usage } = require('../util/util')

module.exports = {
    name: 'win',
    description: 'Who would win!?',
    aliases: ['who'],
    usage: '<user1> <user2>',
    args: true,
    guildOnly: true,

    async execute(message, args) {
        const mentions = await message.mentions.users

        if (mentions.size === 2) {
            params = {
                user1: mentions.first().avatarURL,
                user2: mentions.last().avatarURL
            }
            return neko('whowouldwin', params, message)
        }
        return message.reply(usage(this))
    }
}