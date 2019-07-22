const hype = [
    { name: 'sparkling_heart', emoji: '💖', isID: false },
    { name: 'tada', emoji: '🎉', isID: false },
    { name: 'confetti_ball', emoji: '🎊', isID: false },
]

const accept = '451356007747026944'
const heart = '602593297986486295'

const thumbsUp = '👍'
const thumbsDown = '👎'

module.exports = {

    getAcceptEmoji() { return accept },
    getThumbsUp() { return thumbsUp },
    getThumbsDown() { return thumbsDown },

    async getHypeEmoji(msg1, msg2) {
        await hype.map(emoji => {
            msg1.react(emoji.emoji)

            if (msg2)
                msg2.react(emoji.emoji)
        })
    },

    getEmoji(name, client) {
        let emoji = undefined

        client.emojis.map(em => {
            if (em.name === name)
                emoji = em
        })

        return emoji
    },

    getRandomEmoji() {
        const rand = Math.floor(Math.random() * hype.length)
        let result = this.getEmoji(hype[rand].name)
        return result
    },
}