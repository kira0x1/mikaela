const Discord = require('discord.js')
const { Users } = require('../../../database/dbObjects')
const currency = new Discord.Collection()

module.exports = {
    helper: true,

    async add(id, amount) {
        const user = currency.get(id)

        if (user) {
            user.balance += Number(amount)
            return user.save()
        }
        const newUser = await Users.create({ user_id: id, balance: amount })
        currency.set(id, newUser)
        return newUser
    },
    getBalance(id) {
        const user = currency.get(id)
        return user ? user.balance : 0
    },
    async init() {
        const storedBalances = await Users.findAll()
        storedBalances.forEach(b => currency.set(b.user_id, b))
    }
}