const { Users, Songs, UserSongs } = require('../../database/dbObjects')

const users = []
const songs = []
const favorites = []

module.exports = {
    name: 'user',
    helper: true,

    getUsers() {
        return users
    },

    async addFavorite(song, id, username) {
        await this.addUser(id, username)
        //Add the song to the database if it doesnt exist there already
        const songAdded = await this.addSong(song)

        //Make sure the user doesnt already have the song set to favorites
        if (this.isSongFavorite(song.id, username))
            return

        const newSong = await UserSongs.create({ song_id: song.id, user_name: username })
        favorites.push({ song_id: song.id, user_name: username, song: songAdded })
        return newSong
    },

    async removeFromFavorite(song_id, user_name) {
        const song = this.isSongFavorite(song_id, user_name)
        if (!song) return

        await UserSongs.destroy({
            where: {
                user_name: user_name,
                song_id: song_id
            }
        })

        const songIndex = favorites.indexOf(song)
        if (songIndex != -1)
            favorites.splice(songIndex, 1)
    },

    isSongFavorite(song_id, user_name) {
        return favorites.find(s => s.song_id === song_id && s.user_name === user_name)
    },

    async getUserFavorites(id, username) {
        const user = await this.addUser(id, username)
        const songs = await favorites.map(s => s.user_name === username)
        return songs
    },

    getFavorites() {
        return favorites
    },

    getSongByID(id) {
        return songs.find(song => song.song_id === id)
    },

    async addSong(song) {
        const result = songs.find(s => s.song_id === song.id)
        if (result) return result

        const newSong = await Songs.create({ song_id: song.id, song_title: song.title, song_url: song.url })
        songs.push({ song_id: song.id, song_title: song.title, song_url: song.url })
        return newSong
    },

    //NOTE add song to paramaters
    async addUser(id, username) {
        const user = users.find(usr => usr.user_id === id)
        if (user) return user

        const newUser = await Users.create({ user_id: id, user_name: username })
        users.push({ user_id: id, user_name: username })
        return newUser
    },
    async init() {
        const allUsers = await Users.findAll({ attributes: ['user_id', 'user_name'] }, { raw: true })
        allUsers.map((data) => users.push(data.toJSON()))

        const allSongs = await Songs.findAll({ attributes: ['song_id', 'song_title', 'song_url'] }, { raw: true })
        allSongs.map((data) => songs.push(data.toJSON()))

        const allFavorites = await UserSongs.findAll({ attributes: ['song_id', 'user_name'] }, { raw: true })
        allFavorites.map((data) => favorites.push(data.toJSON()))
    },
}