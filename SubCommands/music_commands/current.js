const Discord = require('discord.js')
const { GetCurrentSong } = require('./queue')
const { ConvertDuration } = require('./musicUtil')
const { quickEmbed } = require('../../util/embedUtil')

module.exports = {
    name: 'current',
    description: 'Displays the current song',
    aliases: ['np', 'c'],
    cooldown: 3,
    guildOnly: true,

    async execute(message, args) {
        const song = GetCurrentSong()
        if (!song) return quickEmbed(`No song being played currently`)

        const duration = ConvertDuration(song.duration)

        let minutes = Math.floor(song.duration / 60)
        let seconds = Math.floor(song.duration - minutes * 60)
        if (seconds < 10) '0' + seconds

        let embed = new Discord.RichEmbed()
            .setTitle(song.title)
            .setDescription(duration + `\n<${song.url}>`)
            .setColor(0xc71459)

        message.channel.send(embed)
    }
}