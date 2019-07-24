const fs = require('fs')
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
sequelize.import('./models/UserCommands.js')
const Commands = sequelize.import('./models/Commands.js')

const force = process.argv.includes('--force') || process.argv.includes('-f')

sequelize.sync({ force }).then(async () => {
    const commands = [];

    const commandFiles = fs.readdirSync('../commands').filter(file => file.endsWith('.js'))

    for (const file of commandFiles) {
        const command = require(`../commands/${file}`) 
        commands.push(Commands.upsert({ name: command.name }))
    }

    await Promise.all(commands)
    console.log(`Synced...`)
    sequelize.close()
}).catch(console.error)