const discord = require('discord.js')
const { getAlias } = require('../../util/util')

var isConnected = false
var connection
var voiceChannel

module.exports = {
    name: 'stream',
    description: 'handles streams',
    aliases: ['join', 'leave'],
    usage: '',
    guildOnly: true,

    async execute(message, args) {
        const al = getAlias(this.aliases, message.content)
        if (al === 'join')
            await Join(message)
        else if (al === 'leave')
            await Leave(message)

        async function Join(message) {
            console.log('join :0')
            //Join vc 
            //Check if user is in vc or not
            const vc = message.member.voiceChannel
            if (!vc) return message.reply(`You must be in a voicechannel to use this command!`)

            await vc.join().then(conn => {
                voiceChannel = vc
                connection = conn
                isConnected = true
            }).catch(err => {
                message.channel.send(`Failed to join voice channel!`)
                console.log(err)
            })
        }

        async function Leave(message) {
            if (isConnected) {
                await voiceChannel.leave()
            } else if (!isConnected) {
                message.channel.send(`I'm not in a voicechannel to leave one.`)
            }
        }
    }
}