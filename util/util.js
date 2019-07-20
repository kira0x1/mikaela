const { prefix, flagPrefix, perms, users } = require('../config.json')

module.exports = {
  //Reply user with command usage
  usage(command) {
    let reply = ' '
    if (command.usage) reply += `\`${prefix}${command.name}\`${command.usage}`
    return reply
  },

  getFlagsString(command) {
    let reply = ''
    if (command.flags) '**Flags:**' + command.flags.map(f => {
      reply += `**${f.name}**\n`
      if (f.aliases)
        reply += `*Aliases: \`${f.aliases.map(fa => fa)}\`*\n`
      reply += `*${f.description}*\n`
    })
    return reply
  },

  getIDFromMention(mention) {
    const matches = mention.math(/^<@!?(\d+)>$/)
    const id = matches[1]
    return id
  },

  getUserFromMention(mention, client) {
    const id = this.getIDFromMention(mention)
    return client.users.get(id)
  },

  //Check if user has perms
  perms(roles, id) {
    let banned = false

    //check if banned
    const bannedUsers = perms['banned']
    bannedUsers.forEach(user => {
      if (id === users[user]) return (banned = true)
    })

    if (banned) return false
    if (!roles) return true

    for (let i = 0; i < roles.length; i++) {
      const permUsers = perms[roles[i]]
      const user = permUsers.map(uname => users[uname])

      if (user) {
        //if user is in banned then return
        if (user.includes(id)) {
          return true
        }
      }
    }
    return false
  },

  getFlags(flags, args) {
    if (!flags || !args) return console.log(`No flags or args`)

    const argFlags = args.map(f => {
      if (f.startsWith(flagPrefix)) return f.slice(flagPrefix.length)
    })

    let flagsFound = []
    flags.find(f => {
      for (let i = 0; i < argFlags.length; i++) {
        if (f.name === argFlags[i] || f.aliases.find(al => al === argFlags[i])) {
          flagsFound.push({ name: f.name, args: args[i + 1] })
          break
        }
      }
    })
    return flagsFound
  },

  getFlagCommand(flags, arg) {
    return flags.find(f => f.name === arg || f.aliases && f.aliases.includes(arg))
  },

  getFlagArgs(flags, flagName, defaultValue) {
    let flag = defaultValue
    flags.find(f => { if (f.name === flagName && f.args) { flag = f.args } })
    return flag
  },

  getAlias(aliases, content) {
    const arg = content
      .slice(prefix.length)
      .split(/ +/)
      .shift()

    return aliases.find(al => al === arg)
  },
}