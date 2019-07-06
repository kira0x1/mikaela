const { prefix, flagPrefix, perms, users } = require('../config.json')

module.exports = {
  //Reply user with command usage
  usage(command) {
    let reply = ''
    if (command.usage) reply += `\`${prefix}${command.name}\`${command.usage}\n`

    if (command.flags)
      reply += `**Flags:** ${command.flags.map(f =>
        '\n**'.concat('\t', f.name, ':** ', f.aliases.map(fa => '`'.concat(fa, '`')))
      )}`

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
      const userID = users[user]

      if (id === userID) {
        console.log(`banned user[ ${user} ] tried to use command!`)
        return (banned = true)
      }
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
}
