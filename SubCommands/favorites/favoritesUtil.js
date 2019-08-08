const db = require('./users')

async function addSong(song, user) {
    return await db.addFavorite(song, user.id, user.tag)
}

module.exports = { addSong }