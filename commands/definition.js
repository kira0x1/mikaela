const unirest = require('unirest')
const { Message, RichEmbed } = require('discord.js')
const { quickEmbed, pageEmbed } = require('../util/embedUtil')

const { urban } = require('../config').keys

module.exports = {
    name: 'definition',
    description: 'Displays the definition of a word.',
    aliases: ['define', 'def', 'df'],
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
        const query = args.join(' ')

        const headers = {
            'X-RapidAPI-Host': 'mashape-community-urban-dictionary.p.rapidapi.com',
            'X-RapidAPI-Key': urban,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        unirest.get(`https://mashape-community-urban-dictionary.p.rapidapi.com/define?term=${query}`)
            .headers(headers)
            .end(function (result) {
                const body = result.body.list
                if (body === undefined) {
                    let embed = quickEmbed(`No definitions found for "${query}"`)
                    return message.channel.send(embed)
                }

                let definitions = []
                body.map((def, pos) => {
                    if (pos > 3) return
                    definitions.push({ definition: def.definition, example: def.example, word: def.word, link: def.permalink, upvotes: def.upvotes, downvotes: def.downvotes })
                })

                pageEmbed(message, body, 4, query)
            });
    }
}