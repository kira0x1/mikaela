
const ytdl = require('ytdl-core')
const { quickEmbed } = require('../../util/embedUtil')

var isConnected = false
var connection = undefined
var voiceChannel = undefined
var dispatcher = undefined

const que = require('./queue')

const streamOptions = {
    passes: 2,
    type: 'opus',
    volume: 0.5,
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
        if (!vc) return quickEmbed(`You must be in a voicechannel`)

        //NOTE Join voice channel
        await vc.join().then(conn => {
            voiceChannel = vc
            connection = conn
            isConnected = true
        }).catch(err => {
            console.error(err)
            quickEmbed(`Failed to join voice channel!`)
        })
    },

    //ANCHOR Leave vc
    async Leave(message) {
        await voiceChannel.leave()
        que.clearQueue()
        isConnected = false
        connection = undefined
        voiceChannel = undefined
    },

    //ANCHOR Create stream, and play song 
    async playSong(message, song) {
        //NOTE if the bot is not connected then try to connect.
        if (!connection) await this.Join(message)

        const stream = ytdl(song.url, { filter: 'audioonly' })
        dispatcher = await connection.playStream(stream, streamOptions)
        this.isPlaying = true
        dispatcher.on('end', () => this.OnSongEnd(message))
    },

    //ANCHOR Song End
    /**
     *
     *
     * @param {*} message
     */
    async OnSongEnd(message) {
        //NOTE check if there any more songs to play, if not then clear queue, and leave voice channel.
        if (que.hasNextSong() === false) {
            this.Leave()
            return
        }

        const song = await que.shiftNextSong()
        this.playSong(message, song)
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