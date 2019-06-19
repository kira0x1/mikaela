const config = require('../config.json');
const words = config.emojiWords

module.exports = {
    name: 'react',
    description: 'reacts with emojis',

    async execute(message, args) {
        message.delete()

        if (args === undefined) {
            console.log('args is undefined')
            return;
        }

        try {
            let command = args[0]

            message.channel.fetchMessages({
                limit: 1
            }).then(async function (messages) {

                let fetchedMessage = messages.last();

                if (fetchedMessage.reactions.size > 0) {

                    fetchedMessage = await fetchedMessage.reply(args.join(''));
                }

                if (args.length > 1) {
                    command = args
                }

                let emojis = config.emojiWords[command]


                if (emojis != undefined)
                    reactEmoji(config.emojiWords[command], fetchedMessage)
                else {
                    emojis = args.join('')
                    reactEmoji(emojis, fetchedMessage)
                }

            }).catch(error => {
                console.error(error)
            });
        } catch (error) {

        }


        // Returns emoji from config file
        function emoji(name) {
            return config.emojis[name];
        }

        //Loops through array of emojis
        async function reactEmoji(emojis, msg) {
            let i = 0
            while (i < emojis.length) {
                if (emoji(emojis[i]) === undefined) return

                await msg.react(emoji(emojis[i])).catch(error => {
                    let emj = config.emojis[emojis[i]]
                    console.error(`emoji error (${emojis[i]}: ${emj}): ` + error)
                });
                i = i + 1
            }
        }
    }
}