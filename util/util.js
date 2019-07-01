const { prefix, flagPrefix, perms, users } = require('../config.json')

class flagConstruct {
    constructor(name, args) {
        this.name = name
        this.args = args
    }
}

module.exports = {

    checkForFlags(flags, args) {
        if (flags) {
            const flag = args.shift()
            if (!flag) return
            if (flag.startsWith(flagPrefix))
                return flags.find(f => {
                    if (f === flag.slice(flagPrefix.length)) {
                        return new flagConstruct(f, args)
                    }
                })
        }
    },

    //Reply user with command usage
    usage(command) {
        console.log(`usage called for: ${command.name}`)
        let reply = `Arguments missing for command: ${command.name}`
        if (command.usage) {
            reply += `\nUsage: \`${prefix}${command.name} ${command.usage}\``
        }
        return reply
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
                return banned = true
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
    }
}
