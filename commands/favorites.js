const userDB = require('./favorites/users')
const Discord = require('discord.js')
const music = require('./music')
const musicUtil = require('./music_commands/musicUtil')
const { searchForUser } = require('../util/util')

const flags = [
    (list = { name: 'list', aliases: ['l', 'ls'], description: 'Lists favorite songs' }),
    (add = { name: 'add', description: 'Adds a song to favorite songs' }),
    (remove = { name: 'remove', aliases: ['del', 'rm', 'rem'], description: 'Remove song from favorites' }),
    (play = { name: 'play', aliases: ['p'], description: 'Play a song from your favorites' }),
    (info = { name: 'info', aliases: ['i'], description: 'Displays info about a song' }),

]

const commandsMessage = `**Commands:** ${flags.map(f => `\`${f.name}\``)}`

module.exports = {
    name: 'favorites',
    aliases: ['f', 'fav', 'favorite'],
    description: 'Favourite songs',
    guildOnly: true,
    args: true,
    usage: ' \`<command>\`\n' + commandsMessage,
    flags: flags,

    async execute(message, args) {
        const arg = args.shift()
        const cmd = this.flags.find(f => f.name === arg || f.aliases && f.aliases.includes(arg))

        if (!cmd) return message.channel.send(`"**${arg}**" is not a command\n` + commandsMessage)
        await this.callCommand(cmd, message, args)
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

            return userDB.getSongByID(song.song_id)
        }
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

    /**
     *
     *
     * @param {Discord.Message} message
     * @param {String} query
     * @returns
     */
    async listFav(message, query) {
        let target = message.mentions.members.first() || message.author

        if (query) {
            target = await searchForUser(query, message)
        }


        if (!target) {
            const errEmbed = new Discord.RichEmbed()
                .setTitle(`Couldnt find anyone with the username **${query}**`)

            return message.channel.send(errEmbed)
        }

        let userTag = query ? target.user.tag : target.tag
        console.log(`Found: ${userTag}`)
        const favorites = this.getFavByUser(userTag)

        let embed = new Discord.RichEmbed()
            .addField(`**${target.tag || query || `Couldnt Find user "${query}"`}**\tfavorite songs`, '\u200b')
            .setThumbnail(target.avatarURL || target.user.avatarURL)
            .setColor(0xc71459)

        if (!favorites.length) {
            embed.addField('\u200b', '***no favorites 😕***')
        }
        favorites.map((fav, position) => embed.addField(`***(${position + 1}***)  *${userDB.getSongByID(fav.song_id).song_title}*`, '\u200b'))

        return message.channel.send(embed)
    },

    //ANCHOR Add song to favorites
    async addSong(message, args) {
        const target = message.author

        //If no arguments then return
        if (!args.length)
            return message.channel.send(`\`No song given\``)

        //Search for song
        const query = args.join(' ')
        const song = await musicUtil.GetSong(query)

        //If song is not found then return
        if (!song) return message.channel.send(`Couldnt find video: **${query}**`)

        //Add the song to favorites
        const songAdded = await userDB.addFavorite(song, target.id, target.tag)

        //If the song is already in the users favorites return
        if (!songAdded) return message.channel.send(`You have already added this song to your favorites`)

        //Tell the user they succesfuly added their song to favorites
        const ms = await message.channel.send(`Added song : **${song.title}** to your favorites`)
    },

    //ANCHOR Remove song from favorites
    async removeSong(message, args) {
        const songPicked = this.getSongByIndex(message, args.shift())
        if (!songPicked) return
        await userDB.removeFromFavorite(songPicked.song_id, message.author.tag)

        const embed = new Discord.RichEmbed()
            .setTitle(`Removing from favorites:\n**${songPicked.song_title}**`)
            .setColor(0xc71459)

        message.channel.send(embed)
    },

    /**
     *
     *
     * @param {*} cmd
     * @param {*} message
     * @param {Array<String>} args
     */
    async callCommand(cmd, message, args) {
        if (cmd.name === 'list')
            await this.listFav(message, args.join(' '))
        else if (cmd.name === 'add')
            await this.addSong(message, args)
        else if (cmd.name === 'remove')
            await this.removeSong(message, args)
        else if (cmd.name === 'info')
            await this.displaySongInfo(message, args)
        else if (cmd.name === 'play')
            await this.playSong(message, args)
    },

    async playSong(message, args) {
        const songInfo = await this.getSongByIndex(message, args)
        if (!songInfo) return
        music.PlaySong(message, musicUtil.CreateSong(songInfo.song_title, songInfo.song_url, songInfo.song_id, songInfo.song_duration))
    },

    async init() {
        userDB.init()
    }
}