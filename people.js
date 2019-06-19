const peopleData = require('./people.json')
module.exports = {
    async execute(message, name) {
        message.delete()

        const replies = peopleData.replies[name]
        const reply = replies[Math.floor(Math.random() * replies.length)]

        message.channel.send(reply, {
            'reply': peopleData.users[name]
        })

    }
}