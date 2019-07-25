const Discord = require('discord.js')
const { ConvertDuration } = require('./musicUtil')
const { addSong } = require('../favorites/favoritesUtil')
const { getEmoji } = require('../../util/emojis')
const { quickEmbed } = require('../../util/embedUtil')
const ms = require('ms')

var queue = []
var currentSong = undefined
const reactionDuration = ms('7m')

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

    //ANCHOR AddSong

	/**
     *
     *
     * @param {*} song
     * @param {Discord.Message} message
     */
    async AddSong(song, message) {
        queue.push(song)
        const emoji = getEmoji('heart', message.client)
        const duration = ConvertDuration(song.duration)

        let embed = new Discord.RichEmbed()
            .setTitle(song.title)
            .setDescription(`**Added to queue**\n${duration}\n\nReact to ${emoji} to add the song to your favorites`)
            .setURL(song.url)
            .setColor(0xc71459)

        const msg = await message.channel.send(embed)
        await msg.react(emoji)

        const filter = (reaction, user) => {
            return reaction.emoji.name === emoji.name && !user.bot
        }

        const collector = msg.createReactionCollector(filter, { time: reactionDuration })
        const users = []

        //ANCHOR AddSong Collector
        collector.on('collect', async (reaction, reactionCollector) => {
            const user = reaction.users.last()
            const hasSong = await addSong(message, song, user)
            if (!hasSong) return console.log(`has song`)
            quickEmbed(`**${user.tag}** Added song ***${song.title}*** to their favorites`)
        })

        collector.on('end', collected => {
            msg.clearReactions()
        })
    },

    //ANCHOR send embed of queue 
    showQueue(message) {
        if (!this.hasQueue || currentSong === undefined) {
            quickEmbed(`Queue empty...`)
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



