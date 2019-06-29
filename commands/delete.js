const util = require('../util/util')

module.exports = {
    name: 'delete',
    description: 'Delete Mikaelas last message(s)',
    guildOnly: true,
    perms: ['admin'],

    async execute(message, args) {
        let amount = args.shift()

        if (amount === undefined) {
            const lastMessage = message.client.user.lastMessage

            if (lastMessage) {
                console.log(`found last message ${lastMessage}`)
                await lastMessage.delete()
            }
            else console.log(`couldnt find message`)
            return
        }

        if (isNaN(amount)) {
            return message.reply(util.usage(this))
        }

        if (amount < 1 || amount > 50) {
            return message.reply('`amount must be between 1 - 50`')
        }

        amount ++

        message.channel.fetchMessages({ limit: amount })
            .then(messages => {
                let result = messages.filter(m => m.author.id === message.client.user.id)
                util.log(`Messages found: ${result.size}`)
                 message.channel.bulkDelete(result).then(dlt => {
                    console.log(`Deleted ${dlt.size}`)
                }).catch(err => {
                console.error(`Error: ${err}`)
                })
            }).catch(err => {
                console.error(`Error: ${err}`)
            })

    }
}