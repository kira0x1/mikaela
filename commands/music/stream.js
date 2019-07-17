const { getAlias } = require('../../util/util')
const queue = require('./queue')
const config = require('../../config.json')
const ytdl = require('ytdl-core')
const youTubeKey = config.keys.youTubeKey

var isConnected = false
var connection
var voiceChannel

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
    usage: '',
    helper: true,
    guildOnly: true,
    isPlaying: false,

    async execute(message, args) {
        const al = getAlias(this.aliases, message.content)
        if (al === 'join')
            await this.Join(message)
        else if (al === 'leave')
            await this.Leave(message)
    },

    async  Join(message) {
        console.log('join :0')
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

    async  Leave(message) {
        if (isConnected) {
            await voiceChannel.leave()
            isConnected = false
        } else if (!isConnected) {
            message.channel.send(`I'm not in a voicechannel to leave one.`)
        }
    },

    async playSong(message, song) {
        if (!isConnected) await this.Join(message)
        if (!isConnected) return message.channel.send(`You must be in a voicechannel`)
        console.log(`Song to play: ${song.link}`)
        const stream = ytdl(song.link, { filter: 'audioonly' })
        const dispatcher = await connection.playStream(stream, streamOptions)
        dispatcher.on('end', () => this.onSongFinished())
    },

    onSongFinished() {
        console.log(`Song has finished!`)
    }
}