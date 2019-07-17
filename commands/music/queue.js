const discord = require('discord.js')
const queue = []
var currentSong = undefined
const stream = require('./stream')

module.exports = {
    name: 'queue',
    description: 'Song Queue',
    aliases: ['q', 'list'],
    usage: ' ',
    guildOnly: true,

    //ANCHOR Execute
    execute(message, args) {
        this.showQueue(message)
    },

    //ANCHOR Add song to queue
    async AddSong(song, message) {
        queue.push({ title: song.title, link: song.video_url })
        message.channel.send(`Added song: **${song.title}** to queue`)

        //NOTE if theres no song currently playing / queue is empty : play the song immediatly
        if (stream.isPlaying === false && queue.length === 1) {
            currentSong = queue.shift()
            await stream.playSong(message, currentSong)
        }
    },

    //ANCHOR send embed of queue 
    showQueue(message) {
        if (!this.hasQueue || currentSong === undefined) {
            message.channel.send(`Queue empty...`)
            return false
        }

        let embed = new discord.RichEmbed()
            .setTitle('Queue\nCurrently Playing: ' + currentSong.title)
            .setColor(0xc71459)

        for (let i = 0; i < queue.length; i++) {
            embed.addField(i + 1, queue[i].title + '\n' + queue[i].link)
        }
        message.channel.send(embed)
        return true
    },

    //ANCHOR returns true if has songs in the queue
    hasQueue() {
        return !(queue.length === 0 || queue === undefined)
    },

    //ANCHOR on song ended
    onSongEnd() {
        console.log(`Queue song end called`)
    },

    test() {
        console.log(`Test called!`)
    }
}



