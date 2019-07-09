const { getInfo } = require('ytdl-core')
const ytdlDiscord = require(`ytdl-core-discord`)

let currentVC = undefined
let isInVoice = false

module.exports = {
    name: 'stream',

    async play(message, args) {
        if (!isInVoice) await this.join(message, args)
    },

    async join(message, args) {
        const vc = message.member.voiceChannel
        if (!vc) return message.channel.send(`You're not in a vc`)
        currentVC = vc
        vc.join()
        isInVoice = true
    },

    async leave(message, args) {
        if (!isInVoice) return message.channel.send(`Im not in a voice channel`)
        vc.disconnect()
        isInVoice = false
        currentVC = undefined
    }
}