const { neko } = require('../util/util')
module.exports = {
    name: 'trump',
    aliases: ['tweet','tt'],
    description: 'Trump Tweet ;)',
    args: true,
    usage: '<text>',
    guildOnly: true,

    execute(message, args) {
        const params = {text: args.join(' ')}
        neko('trumptweet', params, message)
    }
}