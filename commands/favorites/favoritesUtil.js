const db = require('./users')

async function addSong(message, song, user) {
    return db.addFavorite(song, user.id, user.tag)
}

module.exports = { addSong }