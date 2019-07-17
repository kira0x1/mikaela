const stream = require('./stream')

module.exports = {
    name: 'skip',
    description: 'skips the current song',
    alias: ['fs', 'next', 'sk'],
    guildOnly: true,

    execute(message, args) {
        stream.SkipSong()
    }
}
