const userDB = require('../subcommands/favorites/users')
const Discord = require('discord.js')
const music = require('./music')
const musicUtil = require('../subcommands/music_commands/musicUtil')
const { CreateSong } = require('../subcommands/music_commands/musicUtil')
const { searchForUser } = require('../util/util')
const { quickEmbed, songPageEmbed } = require('../util/embedUtil')


const flags = [
    (list = { name: 'list', aliases: ['l', 'ls'], description: 'Lists favorite songs' }),
    (add = { name: 'add', description: 'Adds a song to favorite songs' }),
    (remove = { name: 'remove', aliases: ['del', 'rm', 'rem', 'r'], description: 'Remove song from favorites' }),
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

        if (!cmd) return quickEmbed(`"**${arg}**" is not a command\n` + commandsMessage)
        await this.callCommand(cmd, message, args)
    },

    async displaySongInfo(message, args) {
        const songId = args.shift()
        const userFound = await this.getUser(message, args)
        if (!userFound) return

        const song = await this.getSongByIndex(message, userFound, songId)

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

    /**
     *
     *
     * @param {Discord.Message} message
     * @param {string} query
     * @returns
     */
    async getSongByIndex(message, user, query) {
        if (!query) return
        if (!query.length) return

        songs = this.getFavByUser(user.tag)
        let song = songs[query - 1]

        if (!song) {
            message.reply(`**Song at position ${query} not found**`)
            return
        }

        return userDB.getSongByID(song.song_id)
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
     * @param {String} args
     * @returns
     */
    async listFav(message, args) {
        let target = await this.getUser(message, args)
        if (!target) return

        let userTag = target.tag
        const favorites = this.getFavByUser(userTag)

        let pages = []
        const songsPerPage = 6
        const pageAmount = Math.floor(favorites.length / songsPerPage);

        favorites.map((fav, position) => {
            let currentPage = 0

            if (pageAmount > 0)
                currentPage = Math.floor(position / songsPerPage)

            if (pages.length <= currentPage) pages.push({ page: currentPage, songs: [] })
            pages[currentPage].songs.push(userDB.getSongByID(fav.song_id))
        })

        songPageEmbed(message, target, pages, pageAmount, songsPerPage)
    },

    /**
     *
     *
     * @param {Discord.Message} message
     * @param {string} args
     * @returns
     */
    async getUser(message, args = undefined) {
        let query = args ? args.join(' ') : args
        let target = message.mentions.members.first() || message.author

        if (message.mentions.members.size === 0 && query) {
            target = await searchForUser(query, message)
        }

        if (!target) return await quickEmbed(`Couldnt find anyone with the username **${query}**`)
        let userTag = query ? target.user.tag : target.tag
        return { tag: userTag, user: target }
    },

    //ANCHOR Add song to favorites
    async addSong(message, args) {
        const target = message.author

        //If no arguments then return
        if (!args.length)
            return quickEmbed(`\`No song given\``)

        //Searchz for song
        const query = args.join(' ')
        const song = await musicUtil.GetSong(query)

        //If song is not found then return
        if (!song)
            return quickEmbed(`Couldnt find video: **${query}**`)

        //Add the song to favorites
        const songAdded = await userDB.addFavorite(song, target.id, target.tag)

        //If the song is already in the users favorites return
        if (!songAdded)
            return quickEmbed(`**${message.author.tag}** You already have this song added to your favorites`)

        //Tell the user they succesfuly added their song to favorites
        quickEmbed(`**${message.author.tag}** Added song ***${song.title}*** to their favorites`)
    },

    //ANCHOR Remove  song from favorites
    async removeSong(message, args) {
        const songId = args.shift()
        const songPicked = await this.getSongByIndex(message, message.author, songId)
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
            await this.listFav(message, args)
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
        const songId = args.shift()
        const userFound = await this.getUser(message, args)
        if (!userFound) return

        const songInfo = await this.getSongByIndex(message, userFound, songId)
        if (!songInfo) return

        music.PlaySong(message, CreateSong(songInfo.song_title, songInfo.song_url, songInfo.song_id, songInfo.song_duration))
    },

    async init() {
        userDB.init()
    }
}