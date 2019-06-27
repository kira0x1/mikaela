const agent = require('superagent')
const helper = require('../util/helper')
const goboblin = 'https://tinyurl.com/goboblin'

module.exports = {
    name: 'trap',
    description: 'Trap someone!',
    aliases: ['tr'],
    guildOnly: true,
    usage: '<user>',
    args: true,

    async execute(message, args) {
        //Get user from args

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
            let victim = message.mentions.users.first()

            if (!victim)
                return message.reply(helper.args(this))

            trap = {
                name: victim.username, //victim
                author: message.author.username, //Author
                image: victim.avatarURL //Victims Avatar URL
            }
        }

        await agent.get('https://nekobot.xyz/api/imagegen?type=trap')
            .query(trap)
            .then(response => {
                message.channel.send({ file: response.body.message })
            })
            .catch(error => {
                message.channel.send(`${error}`)
            })
    }
}