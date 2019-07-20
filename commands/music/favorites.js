const userDB = require('../favorites/users')
const musicUtil = require('./musicUtil')
const Discord = require('discord.js')

const flags = [
    (list = { name: 'list', aliases: ['l', 'ls'], description: 'Lists favorite songs' }),
    (add = { name: 'add', description: 'Adds a song to favorite songs' }),
    (remove = { name: 'remove', aliases: ['del', 'rm', 'rem'], description: 'Remove song from favorites' }),
]

module.exports = {
    name: 'favorites',
    aliases: ['fav', 'favorite'],
    description: 'Favourite songs',
    guildOnly: true,
    args: true,
    usage: ' \`[flag]\`',
    flags: flags,

    async execute(message, args) {
        const arg = args.shift()
        const cmd = this.flags.find(f => f.name === arg || f.aliases && f.aliases.includes(arg))

        if (!cmd) return await this.displaySongInfo(message, arg)

        if (cmd.name === 'list')
            await this.listFav(message, args)
        else if (cmd.name === 'add')
            await this.addSong(message, args)
        else if (cmd.name === 'remove')
            await this.removeSong(message, args)
    },

    async displaySongInfo(message, args) {
        const song = this.getSongByIndex(message, args)
        if (!song) return

        const duration = musicUtil.ConvertDuration(song.song_duration)

        let minutes = Math.floor(song.song_duration / 60)
        let seconds = Math.floor(song.song_duration - minutes * 60)
        if (seconds < 10) '0' + seconds

        let embed = new Discord.RichEmbed()
            .setTitle(song.song_title)
            .setDescription(duration + `\n<${song.song_url}>`)
            .setColor(0xc71459)

        message.channel.send(embed)
    },

    getSongByIndex(message, query) {
        if (!query) return console.log(`no query given`)

        songs = this.getFavByUser(message.author.tag)
        let song = songs[query - 1]

        if (!song) {
            message.reply(`**Song at position ${query} not found**`)
            return
        }
        return userDB.getSongByID(song.song_id)
    },

    async removeSong(message, args) {
        const songPicked = this.getSongByIndex(message, args.shift())
        if (!songPicked) return
        await userDB.removeFromFavorite(songPicked.song_id, message.author.tag)

        const embed = new Discord.RichEmbed()
            .setTitle(`Removing from favorites:\n**${songPicked.song_title}**`)
            .setColor(0xc71459)

        message.channel.send(embed)
    },

    getFavByUser(username) {
        let favorites = userDB.getFavorites()
        if (!favorites) return
        const userFavorites = []

        favorites.map((fav) => {
            if (fav.user_name === username)
                userFavorites.push(fav)
        })
        return userFavorites
    },

    async listFav(message) {
        const target = message.mentions.users.first() || message.author
        const favorites = this.getFavByUser(target.tag)
        if (!favorites) return message.channel.send(`User **${target.tag}** has no favorites`)

        let embed = new Discord.RichEmbed()
            .setTitle(`${target.tag}'s favorites`)
            .setColor(0xc71459)

        return message.channel.send(embed)
    },

    async addSong(message, args) {
        const target = message.author
        const query = args.join(' ')
        const song = await musicUtil.GetSong(query)
        if (!song) return message.channel.send(`Couldnt find video: **${query}**`)
        const songAdded = await userDB.addFavorite(song, target.id, target.tag)
        if (!songAdded) return message.channel.send(`You have already added this song to your favorites`)
        return message.channel.send(`Added song : **${song.title}** to favorites`)
    },

    async init() {
        userDB.init()
    }
}