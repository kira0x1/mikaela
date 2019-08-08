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
const Commands = sequelize.import('./models/Commands.js')
const UserCommands = sequelize.import('./models/UserCommands.js')

UserCommands.belongsTo(Commands, { foreignKey: 'command_name', as: 'command' })
UserSongs.belongsTo(Songs, { foreignKey: 'song_id', as: 'song' })

Users.prototype.getUsers = async function () {
    return Users.findAll().then(user => {
    })
}

Users.prototype.getUserSongs = function () {
    return UserSongs.findAll({
        where: { user_name: this.user_name },
        include: ['item']
    })
}

Songs.prototype.getSong = async function (id) {
    return await Songs.findOne({
        where: { id: id }
    })
}

Songs.prototype.addSong = async function (song) {
    return await Songs.create({ song_id: song.id, song_title: song.title, song_url: song.url, song_duration: song.duration })
}

module.exports = { Users, Songs, UserSongs, Commands, UserCommands }