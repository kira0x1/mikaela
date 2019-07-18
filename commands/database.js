const Discord = require('discord.js')
const Op = require('sequelize')
const { Users, CurrencyShop } = require('../database/dbObjects')
const currency = new Discord.Collection()

module.exports = {
    name: 'database',
    aliases: ['db'],
    description: 'Database testing command',
    perms: ['admin'],

    execute(message, args) {
        console.log(`Hello!`)
    }
}