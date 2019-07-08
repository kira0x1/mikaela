const agent = require('superagent')
const { getFlags } = require('../util/util')

const flags = [(amount = { name: 'amount', aliases: ['n'] })]

module.exports = {
  name: 'lewd',
  description: 'Posts nsfw content uwu',
  aliases: ['nsfw', 'pn', 'hass', 'hmidriff', 'pgif', '4k', 'hentai', 'holo', 'hneko', 'hkitsune', 'anal', 'gonewild', 'ass', 'pussy', 'thigh', 'hthigh'],
  cooldown: 2,
  flags: flags,

  execute(message, args) {
    const flag = getFlags(flags, args)
    let search = this.aliases.find(a => message.content.startsWith('.' + a))
    if (!search) search = 'hentai'

    let amount = flag.find(f => f.name === 'amount')
    if (!amount) amount = 1

    if (amount < 1 || amount > 10) return message.channel.send('Amount must be between 1 - 10')

    if (message.channel.nsfw === false) return

    for (let i = 0; i < amount; i++) {
      agent
        .get('https://nekobot.xyz/api/image')
        .query({ type: search })
        .then(result => {
          message.channel.send({ file: result.body.message })
        })
        .catch(() => console.error)
    }
  },
}
