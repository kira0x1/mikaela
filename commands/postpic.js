const log = require('./logger.js')
const google = require('google-images')

const config = require('../config.json')

const { cse, api } = config.keys

const gm = new google(cse, api)

const nsfwAliases = ['.nsfw', '.nsf', '.n']

module.exports = {
    name: 'postpic',
    description: 'Searches for an image',
    aliases: ['pic', 'post', 'nsf', 'nsfw', 'n'],
    usage: '[search]',
    guildOnly: true,
    cooldown: 3.6,
    args: true,

    async execute(message, args) {
        try {
            const searchQuery = args.join(' ');
            const loadingMsg = await message.channel.send(`Searching for \'${searchQuery}\'...`)

            let searchSafety = 'medium'
            let nsfw = false

            //Check if the channel is nsfw
            let nsfwChannel = message.channel.nsfw

            //Check if the channel is an nsfw channel and if the nsfw alias was used
            if (nsfwChannel) {
                nsfwAliases.map(al => {
                    if (message.content.startsWith(al)) {
                        nsfw = true
                    }
                })
            }

            if (nsfw) {
                searchSafety = 'off'
            }

            gm.search(searchQuery, { safe: searchSafety }).then(images => {
                if (!images.length)
                    return message.reply('No images found...')

                const randIndex = Math.floor(Math.random() * images.length)
                const imageResult = images[randIndex]

                //Send image
                message.channel.send(imageResult.url)

            }).catch(error => {
                logMsg(error)
            })
        }
        catch (error) {
            logMsg(error)
        }

        function logMsg(error, level) {
            if (level) {
                error.put(level)
            }
            log.execute(message, [error])
        }
    }
}