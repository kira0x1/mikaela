const hype = [
    { name: 'sparkling_heart', emoji: '💖', isID: false },
    { name: 'tada', emoji: '🎉', isID: false },
    { name: 'confetti_ball', emoji: '🎊', isID: false },
]

const accept = '451356007747026944'

module.exports = {
    async getHypeEmoji(msg1, msg2) {
        await hype.map(emoji => {
            msg1.react(emoji.emoji)

            if (msg2)
                msg2.react(emoji.emoji)
        })
    },

    getAcceptEmoji() {
        return accept
    },

    getRandomEmoji() {
        const rand = Math.floor(Math.random() * hype.length)
        let result = this.getEmoji(hype[rand].name)
        return result
    },

    getEmoji(name, guild) {
        let result = hype.find(f => f.name === name)

        result = result.isID ? guild.emojis.find(emoji => emoji.name === result.name) : result.emoji

        return result
    }
}