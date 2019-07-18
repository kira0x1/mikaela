const Sequelize = require('sequelize')
const { database: dbconfig } = require('../config.json')


const sequelize = new Sequelize(dbconfig.database, dbconfig.user, dbconfig.pass, {
    host: dbconfig.host,
    dialect: 'mysql',
    logging: false,
});

sequelize.import('./models/Users.js')
sequelize.import('./models/Songs.js')
sequelize.import('./models/UserSongs.js')

const force = process.argv.includes('--force') || process.argv.includes('-f')

sequelize.sync({ force })
console.log(`Synced...`)