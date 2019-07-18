const Sequelize = require('sequelize')
const { database: dbconfig } = require('../config')

const sequelize = new Sequelize(dbconfig.database, dbconfig.user, dbconfig.pass, {
    host: dbconfig.host,
    dialect: 'mysql',
    logging: false,
});

const Users = sequelize.import('./models/Users.js')
const CurrencyShop = sequelize.import('./models/CurrencyShop.js')
const UserItems = sequelize.import('./models/UserItems.js')

UserItems.belongsTo(CurrencyShop, { foreignKey: 'item_id', as: 'item' })

Users.prototype.addItem = async function (item) {
    const userItem = await UserItems.findOne({
        where: { user_id: this.user_id, item_id: item.item_id }
    })

    if (userItem) {
        userItem.amount += 1
        return userItem.save()
    }

    return UserItems.create({ user_id: this.user_id, item_id: item_id, amount: 1 })
}

Users.prototype.getItems = function () {
    return UserItems.findAll({
        where: { user_id: this.user_id },
        include: ['item'],
    })
}

module.exports = { Users, CurrencyShop, UserItems }