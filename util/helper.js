const { prefix } = require('../config.json')
module.exports = {
    //For when the user does not put in args
    args(command) {
        let reply = `Arguments missing for command: ${command.name}`
        if (command.usage) {
            reply += `\nUsage: \`${prefix}${command.name} ${command.usage}\``
        }
        return reply
    }
}