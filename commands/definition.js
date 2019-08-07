const rp = require('request-promise')
const { quickEmbed, embedUrbanDictionary, embedWordsApi } = require('../util/embedUtil')
const { getFlags } = require('../util/util')
const { rpKey } = require('../config').keys


const flags = [
    (urban = { name: 'urban', aliases: ['u', 'ur'], description: 'Search urban dictionary' }),
]

module.exports = {
    name: 'define',
    description: 'Displays the definition of a word.',
    aliases: ['definition', 'def', 'df', 'd'],
    cooldown: 3,
    usage: ' \`[word]\`',
    flags: flags,
    guildOnly: true,
    args: true,

    /**
     *
     *
     * @param {Discord.Message} message
     * @param {Array} args
     */
    async  execute(message, args) {
        const flags = getFlags(this.flags, args)
        let query = args.join(' ')

        if (flags.length > 0) {
            query = []
            args.find(arg => {
                if (!arg.startsWith('-'))
                    query.push(arg)
            })
            query = query.join(' ')

            this.getUrban(query, message)
        }
        else {
            this.getWords(query, message)
        }
    },

    getWords(query, message) {
        const options = {
            method: 'GET',
            url: `https://wordsapiv1.p.rapidapi.com/words/${query}/definitions`,
            headers: {
                "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
                "X-RapidAPI-Key": rpKey
            },
            json: true
        }

        rp(options).then(body => {
            embedWordsApi(body, message)
        }).catch(err => {
            quickEmbed(`No definition found for ${query} 😕`)
        })
    },

    getUrban(query, message) {
        const options = {
            method: 'GET',
            uri: `https://mashape-community-urban-dictionary.p.rapidapi.com/define?term=${query}`,
            headers: {
                'X-RapidAPI-Host': 'mashape-community-urban-dictionary.p.rapidapi.com',
                'X-RapidAPI-Key': rpKey,
            },
            json: true,
        }

        rp(options).then(result => {
            let body = result.list
            if (body === undefined) {
                return quickEmbed(`No definition found for ${query} 😕`)
            }
            let definitions = []

            body.map((def, pos) => {
                if (pos > 3) return
                definitions.push({ definition: def.definition, example: def.example, word: def.word, link: def.permalink, upvotes: def.upvotes, downvotes: def.downvotes })
            })

            embedUrbanDictionary(message, body, 4, query)
        });
    }
}