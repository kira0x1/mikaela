const agent = require('superagent')
const util = require('../util/util')

module.exports = {
    name: 'lewd',
    description: 'Posts nsfw content uwu',
    aliases:
        ['nsfw', 'pn', 'hass', 'hmidriff', 'pgif', '4k', 'hentai', 'holo',
            'hneko', 'neko', 'hkitsune', 'kemonomimi', 'anal',
            'gonewild', 'kanna', 'ass', 'pussy', 'thigh', 'hthigh'],
    cooldown: 2,
    flags: ['n'],


    execute(message, args) {
        const al = this.aliases.find(a => message.content.startsWith('.' + a))

        let amount = 1
        let search = 'hentai'

        const flag = util.checkForFlags(this.flags, args)

        if (flag) {
            if (flag === 'n') {
                if (amount < 1 || amount > 4) {
                    return message.reply('Amount must be between 1 - 4')
                }

                amount = args
            }
        }

        if (al && al !== 'nsfw' && al !== 'pn')
            search = al

        if (message.channel.nsfw === true) {
            try {
                for (let i = 0; i < amount; i++) {
                    agent.get('https://nekobot.xyz/api/image')
                        .query({ type: search })
                        .then(result => {
                            message.channel.send({ file: result.body.message });
                        }).catch(err => {
                            console.error(err)
                        })
                }
            }
            catch (error) {
            }
        } else {
            message.channel.send("This isn't NSFW channel!")
        }
    }
}