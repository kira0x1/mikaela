const Discord = require('discord.js')
const { ConvertDuration } = require('./musicUtil')
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
        queue.push(song)
        const duration = ConvertDuration(song.duration)

        let embed = new Discord.RichEmbed()
            .setTitle(song.title)
            .setDescription(`***Added to queue\n\n${duration}***`)
            .setURL(song.url)
            .setColor(0xc71459)
            .setFooter(`React to 💝 add/remove from favorites`)

        const msg = await message.channel.send(embed)
        await msg.react('💝')
    },

    //ANCHOR send embed of queue 
    showQueue(message) {
        if (!this.hasQueue || currentSong === undefined) {
            message.channel.send(`Queue empty...`)
            return false
        }

        const duration = ConvertDuration(currentSong.duration)

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



