const Sequelize = require('sequelize')
const { database: db } = require('../config')

const sequelize = new Sequelize(db.db, db.user, db.pass, {
    host: db.host,
    dialect: 'sqlite',
    logging: false,
    operatorsAliases: false,
    // SQLite only
    storage: 'database.sqlite',
});

//NOTE Creating Table

const Fave = sequelize.define('favourites', {
    id: {
        type: Sequelize.STRING,
        unique: true,
    },
    username: Sequelize.STRING,
});

module.exports = {

    CreateTable() {
        Fave.sync()
    }
}