const { getInfo } = require('ytdl-core')
const ytdlDiscord = require(`ytdl-core-discord`)
const log = console.log
const chalk = require('chalk')

let currentVC = undefined
let isInVoice = false

module.exports = {
    name: 'stream',

    async play(message, args) {
        await this.join(message, args).then(connection => {
            if (connection) log(chalk.blue.bold(`Connected!`))
        })
    },

    async join(message, args) {
        const vc = message.member.voiceChannel
        if (!vc) return message.channel.send(`You're not in a vc`)
        isInVoice = true
        currentVC = vc
        return vc.join()
    },

    async leave(message, args) {
        if (!isInVoice) return message.channel.send(`Im not in a voice channel`)
        vc.disconnect()
        isInVoice = false
        currentVC = undefined
    }
}