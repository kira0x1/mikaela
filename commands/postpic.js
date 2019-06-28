const config = require('../config.json')
const google = require('google-images')
const { cse, api } = config.keys
const gm = new google(cse, api)

module.exports = {
    name: 'postpic',
    description: 'Searches for an image',
    aliases: ['img', 'pic', 'post'],
    usage: '[search]',
    guildOnly: true,
    cooldown: 3.6,
    args: true,

    execute(message, args) {
        const searchQuery = args.join(' ');
        let searchSafety = 'medium'

        gm.search(searchQuery, { safe: searchSafety }).then(images => {
            if (!images.length)
                return message.reply('No images found...')

            const randIndex = Math.floor(Math.random() * images.length)
            const imageResult = images[randIndex]

            //Send image
            message.channel.send(imageResult.url)

        }).catch(error => {
            console.error(error)
        })
    }
}