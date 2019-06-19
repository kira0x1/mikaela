const talk = require('../talk.json')

module.exports = {
    name: '',
    description: 'converses with people',

    async execute(message, args) {
        const command = args[args.length - 1]

        let word = command
        let wlength = args.length - 1

        if (message.mentions.members.size > 0) {
            word = args.join('')
        } else {
            for (let i = 0; i < wlength; i++) {
                word += args[i]
            }
        }

        word = word.toLowerCase()

        const words = talk.words

        try {
            if (words[word] === undefined && !message.mentions.members.size > 0) {
                let reactWord = [word].toLowerCase()
                message.client.commands.get('react').execute(message, reactWord)
                return
            }
        } catch (error) {
            console.error('word was undefined')
        }

        try {
            let reply = words[word.toLowerCase()][Math.floor(Math.random() * words[word].length)]
            message.reply(reply)
        } catch (error) {
            console.error('error: ' + word)
        }
    }
}