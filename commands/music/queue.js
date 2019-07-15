const discord = require('discord.js')
const queue = []
var currentSong = ' '

module.exports = {
    name: 'queue',
    description: 'Song Queue',
    aliases: ['q', 'list'],
    usage: ' ',
    guildOnly: true,

    async execute(message, args) {
        if (this.hasQueue())
            this.showQueue(message)
        else
            message.channel.send('Queue is empty')
    },

    showQueue(message) {
        if (!this.hasQueue() && currentSong === undefined) {
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

    hasQueue() {
        return !(queue.length === 0 || queue === undefined)
    },

    AddSong(song, message) {
        queue.push({ title: song.title, link: song.link })
        message.channel.send(`Song ${song.title} added`)
    },
}