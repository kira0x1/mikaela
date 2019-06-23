const vcID = '585850878532124680'
const url = 'https://www.youtube.com/watch?v=APW5h0WYOE4'

const ct = require('common-tags')
const ytdl = require('ytdl-core')

const flags = [
    join = { name: 'join', aliases: ['j'] },
    leave = { name: 'leave', aliases: ['lv', 'l'] },
    pause = { name: 'pause', aliases: ['pause', 'stop', 's'] },
    play = { name: 'play', aliases: ['p', 'start'] }
]

module.exports = {
    name: 'voice',
    aliases: ['v', 'vc'],
    perms: ['admin'],
    guildOnly: true,
    usage: ct.commaLists`
    [flag] 
    ${flags.map(f => f.name)}
    `,
    cooldown: 1,
    args: true,

    execute(message, args) {
        //For now hard coding channel id
        arg = args.shift()
        const channel = message.client.channels.get(vcID)
        const vc = message.member.voiceChannel

        let flag = flags.find(f => f.name === arg) || flags.find(f => f.aliases && f.aliases.includes(arg))

        console.log(`flag (${arg}) : ${flag.aliases}`)

        switch (flag.name) {
            case 'join':
                if (!vc) return console.error('Youre not in a vc')

                vc.join().then(connection => {
                    console.log(`Joined vc: ${message.member.voiceChannel.name}`)
                    const stream = ytdl(url, { filter: 'audioonly' })
                    const dispatcher = connection.playStream(stream)

                    dispatcher.on('end', () => vc.leave())
                })

                break
            case 'leave':
                vc.leave()
                break
        }
    }
}