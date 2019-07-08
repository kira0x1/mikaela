const { usage, getFlags } = require('../util/util')

const flags = [
  (me = {
    name: 'me',
    aliases: ['m'],
    description: 'Deletes users messages instead of the bots',
  }),
  (force = {
    name: 'force',
    aliases: ['f'],
    description: 'Force a command',
  }),
  (both = {
    name: 'both',
    aliases: ['b'],
    description: 'Deletes **both** the bots and the users messages',
  }),
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

    let amount = 1
    let me = flagsFound.find(fg => fg.name === 'me')
    let force = flagsFound.find(fg => fg.name === 'force')
    let both = flagsFound.find(fg => fg.name === 'both')

    if (!both) amount = me === undefined ? args.shift() : me.args
    else amount = both.args !== undefined ? both.args : amount

    amount = amount === undefined ? 1 : amount
    amount = amount !== undefined && me !== undefined && me.args === undefined ? 1 : amount

    if (isNaN(amount)) return

    if (!force && (amount < 1 || amount > 25)) {
      return message.reply('`amount must be between 1 - 25`')
    }

    amount++

    await message.channel
      .fetchMessages({ limit: amount })
      .then(async messages => {
        const id = message.client.user.id
        let result = messages.filter(m => m.author.id === id)

        if (both && !me) result = messages.filter(m => m.author.id === message.author.id || m.author.id === id)
        else if (me) result = messages.filter(m => m.author.id === message.author.id)
        await message.channel.bulkDelete(result).catch()
      })
      .catch()
  },
}
