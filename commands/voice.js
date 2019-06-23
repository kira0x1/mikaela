const vc = '585850878532124680'
const url = 'https://www.youtube.com/watch?v=d6EDiwSHrTY'

module.exports = {
    name: 'voice',
    aliases: ['v', 'vc'],
    perms: ['admin'],
    guildOnly: true,
    usage: '[join | leave]',
    cooldown: 1,
    args: true,

    execute(message, args) {
        //For now hard coding channel id
        arg = args.shift()
        const channel = message.client.channels.get(vc)

        if (!channel) {
            return console.log('channel does not exist')
        }

        if (arg === 'join') {
            channel.join(vc).then(connection => {
                console.log(`joined vc: ${channel.name}`)

                const dispatcher = connection.playFile(url)

            }).catch(error => {
                console.error(`UWU\n ${error}`)
            })
        }
        else if (arg === 'j') {
            if (message.member.voiceChannel) {
                console.log(`Member ${message.member.displayName} is in voice channel ${message.member.voiceChannel.name}`)
                message.member.voiceChannel.join()
                    .then(connection => {
                        console.log(`Joined vc: ${message.member.voiceChannel.name}`)
                        connection.playArbitraryInput(url)
                    })
            } else {
                console.error('You\'re not in a voice channel')
            }
        }
        else if (arg === 'leave') {
            channel.leave()
            console.log(`Left vc: ${channel.name}`)
        }
    }
}