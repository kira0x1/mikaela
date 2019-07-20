const hype = [
    { name: 'sparkling_heart', emoji: '💖', isID: false },
    { name: 'tada', emoji: '🎉', isID: false },
    { name: 'confetti_ball', emoji: '🎊', isID: false },

    // { name: 'gift_heart', emoji: '💝', isID: false },
    // { name: 'POGGERS', emoji: '588715176577073180', isID: true }
    // { name: 'cursor', emoji: '602159575420108840', isID: true }
]

module.exports = {
    getHypeEmoji(message, client) {
        hype.map(emoji => {
            message.react(emoji.emoji)
        })
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