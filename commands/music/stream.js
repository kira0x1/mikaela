const ytdl = require('ytdl-core')

var isConnected = false
var connection = undefined
var voiceChannel = undefined
var dispatcher = undefined

const que = require('./queue')

const streamOptions = {
    passes: 1,
    type: 'opus',
    seek: 0,
    volume: 0.2,
}

module.exports = {
    name: 'stream',
    description: 'handles streams',
    aliases: ['str'],
    usage: ' ',
    helper: true,
    guildOnly: true,

    //ANCHOR Join vc
    async Join(message) {

        //NOTE Check if user is in vc or not
        const vc = message.member.voiceChannel

        if (!vc) return message.channel.send(`You must be in a voicechannel`)

        //NOTE Join voice channel
        await vc.join().then(conn => {
            voiceChannel = vc
            connection = conn
            isConnected = true
        }).catch(err => {
            console.error(err)
            message.channel.send(`Failed to join voice channel!`)
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
        //NOTE if the bot is not connected then try to connect.
        if (!isConnected) await this.Join(message)
        if (!isConnected) return

        const stream = ytdl(song.url, { filter: 'audioonly' })
        dispatcher = await connection.playStream(stream, streamOptions)
        this.isPlaying = true
        dispatcher.on('end', () => this.OnSongEnd(message))
    },

    //ANCHOR Song End
    OnSongEnd(message) {
        //NOTE check if there any more songs to play, if not then clear queue, and leave voice channel.
        if (que.hasNextSong() === true) {
            const song = que.shiftNextSong()
            this.playSong(message, song)
        } else {
            que.clearQueue()
            this.Leave(message)
        }
    },

    //ANCHOR Skip Song
    SkipSong() {
        if (dispatcher)
            dispatcher.end()
    },

    InVoice() {
        return isConnected
    }
}