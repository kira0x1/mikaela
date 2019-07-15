const ytdl = require('ytdl-core')
const queue = require('./queue')

module.exports = {
    name: 'play',
    description: 'plays music',
    usage: `[link | search]`,
    aliases: ['p', 'play'],

    async execute(message, args) {
        const query = args.join(' ')

        const song = ytdl.getBasicInfo(query).then(song => {
            queue.AddSong(song, message)
        }).catch(err => console.log(err))
    }
}