const { prefix, perms, users } = require('../config.json')

module.exports = {

    //Sends a message to the channel
    channelSend(message, content) {
        message.channel.send(content)
    },

    //Reply user with command usage
    args(command) {
        let reply = `Arguments missing for command: ${command.name}`
        if (command.usage) {
            reply += `\nUsage: \`${prefix}${command.name} ${command.usage}\``
        }
        return reply
    },

    //Check if user has perms 
    perms(roles, id) {
        if (roles === undefined)
            return true

        for (let i = 0; i < roles.length; i++) {
            const permUsers = perms[roles[i]]
            const user = permUsers.map(uname => users[uname])

            if (user) {
                if (user.includes(id)) {
                    return true
                }
            }
        }

        return false
    }
}
