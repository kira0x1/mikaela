const { neko, usage } = require('../util/util')
const goboblin = 'https://tinyurl.com/goboblin'

module.exports = {
    name: 'trap',
    description: 'Trap card someone!',
    aliases: ['tr'],
    guildOnly: true,
    usage: '<user>',
    args: true,

    execute(message, args) {
        let isGoboblin = false

        let trap = {
            name: 'xxxIRANbOYxxx',
            author: 'Goboblin',
            image: goboblin
        }

        if (args.join(' ') === 'goboblin') {
            isGoboblin = true
        }

        if (!isGoboblin) {
            //Get user from args
            let victim = message.mentions.users.first()

            if (!victim)
                return message.reply(usage(this))

            trap = {
                name: victim.username, //victim
                author: message.author.username, //Author
                image: victim.avatarURL //Victims Avatar URL
            }
        }

        neko('trap', trap, message);
    }
}