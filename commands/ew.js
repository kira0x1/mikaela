module.exports = {
    name: 'ew',

    async execute(message, args) {
        message.delete()

        const replies = ['eww', 'eww thats disgusting', 'wtf :<']
        let reply = replies[Math.floor(Math.random() * replies.length)]
        message.channel.send(reply)
    }
}