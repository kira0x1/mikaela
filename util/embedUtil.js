const Discord = require('discord.js')
const util = require('../util/util')

async function quickEmbed(title) {
    const embed = new Discord.RichEmbed()
        .setTitle(title)
        .setColor(0xc71459)

    await util.getCurrentMessage().channel.send(embed)
}

module.exports = { quickEmbed } 