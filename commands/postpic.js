const log = require('./logger.js')
const google = require('google-images')

const config = require('../config.json')
const { cse, api } = config.keys
const { nsfw } = config.channels

const gm = new google(cse, api)

module.exports = {
    name: 'postpic',
    description: 'Searches for an image',
    aliases: ['p', 'pic', 'img', 'post'],
    usage: '[search]',
    guildOnly: true,
    cooldown: 3.6,
    args: true,

    async execute(message, args) {
        try {
            const searchQuery = args.join(' ');
            const loadingMsg = await message.channel.send(`Searching for \'${searchQuery}\'...`)

            let searchSafety = 'high'

            if (message.channel.id === nsfw) {
                searchSafety = 'off'
            }

            gm.search(searchQuery, { safe: searchSafety }).then(images => {

                if (!images.length)
                    return message.reply('No images found...')

                const randIndex = Math.floor(Math.random() * images.length)
                const imageResult = images[randIndex]

                //Send image
                message.reply(imageResult.url)

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