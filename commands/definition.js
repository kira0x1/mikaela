const { Message, RichEmbed } = require('discord.js')
const chalk = require('chalk')
const ct = require('common-tags')
const log = console.log
const { quickEmbed } = require('../util/embedUtil')
//Get definitions for a word
// options: (for now only urban dictionary, ill add more later)

module.exports = {
    name: 'definition',
    description: 'Displays the definition of a word.',
    aliases: ['df'],
    cooldown: 3,
    usage: ' \`[word]\`',
    guildOnly: true,
    args: true,

    /**
     *
     *
     * @param {Discord.Message} message
     * @param {Array} args
     */
    async execute(message, args) {
        const wordQuery = args.shift().toLowerCase();
        quickEmbed(`Word to search: **${wordQuery}**`)
    }
}