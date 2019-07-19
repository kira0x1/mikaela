const userDB = require('../db/users')
const musicUtil = require('./musicUtil')
const Discord = require('discord.js')

const flags = [
    (list = { name: 'list', aliases: ['l', 'ls'], description: 'Lists favorite songs' }),
    (add = { name: 'add', description: 'Adds a song to favorite songs' })
]

module.exports = {
    name: 'favorites',
    aliases: ['fav', 'favorite'],
    description: 'Favourite songs',
    guildOnly: true,
    usage: ' \`[flag]\`',
    args: true,
    flags: flags,

    async execute(message, args) {
        const arg = args.shift()
        const cmd = this.flags.find(f => f.name === arg || f.aliases && f.aliases.includes(arg))
        if (!cmd) return
        if (cmd.name === 'list')
            await this.listFav(message)
        else if (cmd.name === 'add')
            await this.addSong(message, args)
    },

    async listFav(message) {
        const target = message.mentions.users.first() || message.author
        let favorites = userDB.getFavorites()
        if (!favorites) return `**${target.tag}** has no favorites`

        let embed = new Discord.RichEmbed()
            .setTitle(`${target.tag}'s favorites`)
            .setColor(0xc71459)

        favorites = favorites.map((f, position) => {
            if (f.user_name === target.tag)
                embed.addField(position + 1, `**${userDB.getSongByID(f.song_id).song_title}**`)
        })
        
        return message.channel.send(embed)
    },

    //TODO Add song command
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