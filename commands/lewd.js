const agent = require('superagent')
const { getFlags } = require('../util/util')

const flags = [
    amount = { name: 'amount', aliases: ['n'] }
]

module.exports = {
    name: 'lewd',
    description: 'Posts nsfw content uwu',
    aliases:
        ['nsfw', 'pn', 'hass', 'hmidriff', 'pgif', '4k', 'hentai', 'holo',
            'hneko', 'hkitsune', 'anal',
            'gonewild', 'ass', 'pussy', 'thigh', 'hthigh'],
    cooldown: 2,
    flags: flags,


    execute(message, args) {
        let search = 'hentai'

        const flag = getFlags(flags, args)
        const al = this.aliases.find(a => message.content.startsWith('.' + a))

        let amount = flag.find(f => f.name === 'amount')
        amount = amount === undefined ? 1 : amount.args

        if (amount) {
            if (amount < 1 || amount > 10) {
                return message.channel.send('Amount must be between 1 - 10')
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