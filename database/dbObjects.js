const Sequelize = require('sequelize')
const { database: dbconfig } = require('../config')

const sequelize = new Sequelize(dbconfig.database, dbconfig.user, dbconfig.pass, {
    host: dbconfig.host,
    dialect: 'mysql',
    logging: false,
});

const Users = sequelize.import('./models/Users.js')
const Songs = sequelize.import('./models/Songs.js')

Users.prototype.getSongs = async function () {
    return Users.findAll().then(user => {
        console.log(user)
    })
}

module.exports = { Users }