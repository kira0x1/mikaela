/*NOTE  
Execute node dbInit.js to create the database tables.
Unless you make a change to the models, you'll never need to touch the file again.
If you do make a change to a model, 
you can execute node dbInit.js --force or node dbInit.js -f to force sync your tables.
It's important to note that this will empty out and remake your model tables.
*/

const Sequelize = require('sequelize')
const { database: dbconfig } = require('../config')

const sequelize = new Sequelize(dbconfig.database, dbconfig.user, dbconfig.pass, {
    host: dbconfig.host,
    dialect: 'mysql',
    logging: false,
});

const CurrencyShop = sequelize.import(`./models/CurrencyShop`)
sequelize.import(`./models/UserItems.js`)
sequelize.import(`./models/Users.js`)

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
    const shop = [
        CurrencyShop.upsert({ name: 'Tea', cost: 1 }),
        CurrencyShop.upsert({ name: 'Coffee', cost: 2 }),
        CurrencyShop.upsert({ name: 'Cake', cost: 5 })
    ]

    await Promise.all(shop)
    console.log(`Database synced`)
    sequelize.close()
}).catch(console.error)