const stream = require('./stream')

module.exports = {
    name: 'skip',
    description: 'skips the current song',
    aliases: ['fs', 'next', 'sk'],
    usage: ' ',
    guildOnly: true,

    execute(message, args) {
        stream.SkipSong()
    }
}
