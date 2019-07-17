const discord = require('discord.js')

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
    async AddSong(song, message) {
        queue.push({ title: song.title, link: song.video_url })
        message.channel.send(`Added song: **${song.title}** to queue`)
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



