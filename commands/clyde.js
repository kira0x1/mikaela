const { neko } = require('../util/util')

module.exports = {
    name: 'clyde',
    description: ['Clydify some text'],
    args: true,
    guildOnly: true,

    execute(message, args) {
        let txt = args.join(' ')
        let params = { text: txt }

        neko('clyde', params, message)
    }
}