const log = require('./logger.js')
const google = require('google-images')

const config = require('../config.json')
const { cse, api } = config.google
const { nsfw } = config.channels

const gm = new google(cse, api)



module.exports = {
    name: 'postpic',
    description: 'Gets a picture from google',
    aliases: ['p', 'pic', 'img', 'post'],
    usage: '[search]',
    guildOnly: true,
    cooldown: 3,
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

                //images.map(img => img.url)

                const randIndex = Math.floor(Math.random() * images.length)
                // console.log(`Picked: ${randIndex} out of ${images.length}`)
                const imageResult = images[randIndex]
                message.reply(imageResult.url)

                // loadingMsg.delete().catch(error => { logMsg(error) })
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