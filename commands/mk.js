const channels = require('../config.json').channels

module.exports = {
    name: 'mk',
    description: 'shh.... secret',
    guildOnly: false,
    args: true,
    perms: ['admin'],
    hidden: true,

    execute(message, args) {
        const channelName = args.shift()
        const msg = args.join(' ')

        if (channelName === 'c') {
            message.channel.send(msg)
            return
        }

        let chn = channels[channelName]

        if (chn === undefined) {
            console.log(`couldnt find channel ${channelName}`)
            return
        }
        message.client.channels.get(chn).send(msg)
    }
}