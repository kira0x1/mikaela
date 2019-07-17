const config = require('../../config.json')
const ytdl = require('ytdl-core')
const youTubeKey = config.keys.youTubeKey

var isConnected = false
var connection = undefined
var voiceChannel = undefined
var dispatcher = undefined

const que = require('./queue')

const searchOptions = {
    part: ['snippet', 'contentDetails'],
    chart: 'mostPopular',
    maxResults: 1,
    key: youTubeKey,
}

const streamOptions = {
    bitrate: '120000',
    passes: 1,
    type: 'opus',
    seek: 0,
    volume: 0.3,
}

module.exports = {
    name: 'stream',
    description: 'handles streams',
    aliases: ['str'],
    usage: ' ',
    guildOnly: true,

    //ANCHOR Join vc
    async Join(message) {
        //Join vc 
        //Check if user is in vc or not
        const vc = message.member.voiceChannel
        if (!vc) return message.reply(`You must be in a voicechannel to use this command!`)

        await vc.join().then(conn => {
            voiceChannel = vc
            connection = conn
            isConnected = true
        }).catch(err => {
            message.channel.send(`Failed to join voice channel!`)
            console.log(err)
        })
    },

    //ANCHOR Leave vc
    async Leave(message) {
        if (isConnected) {
            await voiceChannel.leave()
            isConnected = false
        }
    },

    //ANCHOR Create stream, and play song 
    async playSong(message, song) {
        if (!isConnected) await this.Join(message)
        if (!isConnected) return message.channel.send(`You must be in a voicechannel`)
        console.log(`Song to play: ${song.link}`)
        const stream = ytdl(song.link, { filter: 'audioonly' })
        dispatcher = await connection.playStream(stream, streamOptions)
        this.isPlaying = true
        dispatcher.on('end', () => this.OnSongEnd(message))
    },

    OnSongEnd(message) {
        console.log(`on song end`)
        this.PlayNext(message)
    },

    SkipSong() {
        if (dispatcher)
            dispatcher.end()
    },

    PlayNext(message) {
        if (que.hasNextSong() === true) {
            const song = que.shiftNextSong()
            this.playSong(message, song)
        } else {
            que.clearQueue()
            this.Leave(message)
        }
    },

    inVoice() {
        return isConnected
    },
}