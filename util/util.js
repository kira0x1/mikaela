const { prefix, flagPrefix, perms, users } = require('../config.json')

module.exports = {
  //Reply user with command usage
  usage(command) {
    let reply = ''
    if (command.usage) reply += `\`${prefix}${command.name}\`${command.usage}\n`

    if (command.flags) reply += `**Flags:** ${command.flags.map(f => '\n**'.concat('\t', f.name, ':** ', f.aliases.map(fa => '`'.concat(fa, '`'))))}`

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

  getAlias(aliases, content) {
    const arg = content
      .slice(prefix.length)
      .split(/ +/)
      .shift()

    return aliases.find(al => al === arg)
  },
}