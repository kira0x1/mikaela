const Discord = require('discord.js')
const { GetCurrentSong } = require('./queue')

module.exports = {
    name: 'current',
    description: 'Displays the current song',
    aliases: ['np'],
    cooldown: 3,
    guildOnly: true,

    async execute(message, args) {
        const song = GetCurrentSong()
        if (!song) return message.channel.send(`No song being played currently`)

        let minutes = Math.floor(song.duration / 60)
        let seconds = Math.floor(song.duration - minutes * 60)

        let embed = new Discord.RichEmbed()
            .setTitle(song.title)
            .setDescription(`Duration: ${minutes}:${seconds}\n<${song.url}>`)
            .setColor(0xc71459)

        message.channel.send(embed)
    }
}