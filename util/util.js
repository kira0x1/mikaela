const { prefix, flagPrefix, perms, users } = require('../config.json')

class flagConstruct {
    constructor(name, args) {
        this.name = name
        this.args = args
    }
}

module.exports = {

    getFlags(flags, args) {
        if (flags) {
            const flagsFound = [];

            for (let i = 0; i < args.length; i++) {
                const ag = args[i];

                const flagged = []
                if (ag.startsWith(flagPrefix)) {
                    flagged.push(ag);
                }

                flagged.map(f => {
                    flags.map(fg => {
                        let flagGiven = f.slice(flagPrefix.length)
                        if (fg.name === flagGiven)
                            return flagsFound.push(new flagConstruct(fg.name, args[i + 1]));
                        else {
                            fg.aliases.map(als => {
                                if (als === flagGiven) {
                                    let arg = args[i + 1]
                                    flagsFound.push(new flagConstruct(fg.name, arg));
                                    return
                                }
                            })
                        }
                    })
                })
            }
            return flagsFound;
        }
    },

    //Reply user with command usage
    usage(command) {
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
