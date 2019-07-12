const { usage, getFlags } = require('../util/util')

const flags = [
  (me = { name: 'me', aliases: ['m'], description: 'Deletes users messages instead of the bots', }),
  (force = { name: 'force', aliases: ['f'], description: 'Force a command', }),
  (both = { name: 'both', aliases: ['b'], description: 'Deletes **both** the bots and the users messages' }),
  (bots = { name: 'bots', aliases: ['bot', 'bt'], description: 'Delete bot messages' })
]

module.exports = {
  name: 'delete',
  description: 'Delete Mikaelas last message(s)',
  guildOnly: true,
  perms: ['admin'],
  flags: flags,
  aliases: ['dl'],

  async execute(message, args) {
    const flagsFound = getFlags(this.flags, args)
    let flag = ''

    let amount = 1

    if (!isNaN(args[0])) {
      amount = args[0]
    }
    else if (flagsFound.length > 0) {
      flag = flagsFound.shift()
      if (flag.args && !isNaN(flag.args))
        amount = flag.args
    }



    if (!force && (amount < 1 || amount > 25)) {
      return message.reply('`amount must be between 1 - 25`')
    }

    console.log(`Amount: ${amount}`)
    amount++

    await message.channel
      .fetchMessages({ limit: amount })
      .then(async messages => {
        const id = message.client.user.id
        let result = messages.filter(m => m.author.id === id)

        if (flag.name === 'me') result = messages.filter(m => m.author.id === message.author.id)
        else if (flag.name === 'both') result = messages.filter(m => m.author.id === message.author.id || m.author.id === id)
        else if (flag.name === 'bots') result = messages.filter(m => m.author.bot)

        await message.channel.bulkDelete(result).catch()
      })
      .catch()
  },
}
