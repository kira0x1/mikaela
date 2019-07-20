const hype = [
    '💖',
    '🎉',
    '💝'
]

module.exports = {
    getHypeEmoji(client) {
        const rand = Math.floor(Math.random() * hype.length)
        return hype[rand]
    }
}