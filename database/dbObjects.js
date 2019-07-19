const Sequelize = require('sequelize')
const { database: dbconfig } = require('../config')

const sequelize = new Sequelize(dbconfig.database, dbconfig.user, dbconfig.pass, {
    host: dbconfig.host,
    dialect: 'mysql',
    logging: false,
});

const Users = sequelize.import('./models/Users.js')
const Songs = sequelize.import('./models/Songs.js')
const UserSongs = sequelize.import('./models/UserSongs.js')

UserSongs.belongsTo(Songs, { foreignKey: 'song_id', as: 'song' })

Users.prototype.getUsers = async function () {
    return Users.findAll().then(user => {
        console.log(user)
    })
}

Songs.prototype.getSong = async function (id) {
    return await Songs.findOne({
        where: { id: id }
    })
}

Songs.prototype.addSong = async function (song) {
    return await Songs.create({ id: song.id, song_title: song.title, song_url: song.url })
}

Users.prototype.getUserSongs = function () {
    return UserSongs.findAll({
        where: { user_id: this.user_id },
        include: ['item']
    })
}

module.exports = { Users, Songs, UserSongs }