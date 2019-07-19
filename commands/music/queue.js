const Discord = require('discord.js')

var queue = []
var currentSong = undefined

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

    AddSong(song, message) {
        queue.push(song)

        let minutes = Math.floor(song.duration / 60)
        let seconds = Math.floor(song.duration - minutes * 60)

        let embed = new Discord.RichEmbed()
            .setTitle('Song added:\n' + song.title)
            .setDescription(`Duration: ${minutes}:${seconds}`)
            .setColor(0xc71459)

        message.channel.send(embed)
    },

    //ANCHOR send embed of queue 
    showQueue(message) {
        if (!this.hasQueue || currentSong === undefined) {
            message.channel.send(`Queue empty...`)
            return false
        }

        let minutes = Math.floor(currentSong.duration / 60)
        let seconds = Math.floor(currentSong.duration - minutes * 60)
        let duration = `Duration: ${minutes}:${seconds}`

        let embed = new Discord.RichEmbed()
            .setTitle(`Playing: ${currentSong.title}`)
            .setDescription(duration)
            .setColor(0xc71459)

        for (let i = 0; i < queue.length; i++) {
            embed.addField(`(${i + 1})\n${queue[i].title}`, queue[i].url)
        }

        message.channel.send(embed)
        return true
    },

    //ANCHOR returns true if has songs in the queue
    hasQueue() {
        return !(queue.length === 0 || queue === undefined)
    },

    hasNextSong() {
        return this.hasQueue()
    },

    GetSongs() {
        return queue
    },

    GetCurrentSong() {
        return currentSong
    },

    shiftNextSong() {
        currentSong = queue.shift()
        return currentSong
    },

    clearQueue() {
        currentSong = undefined
        queue = []
    }
}



