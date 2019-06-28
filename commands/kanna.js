const { neko } = require('../util/util')

module.exports = {
    name: 'kanna',
    aliases: ['kn'],
    description: 'Kannafy a message :3',
    usage: '<text>',
    args: true,
    guildOnly: true,

    execute(message, args) {
        const query = {
            text: args.join(' ')
        }

        neko('kannagen', query, message);
    }
}