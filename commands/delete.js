const { usage, getFlags } = require('../util/util')

const flags = [
    me = {
        name: 'me',
        aliases: ['m'],
        description: 'Deletes users messages instead of the bots'
    },
    force = {
        name: 'force',
        aliases: ['f'],
        description: 'Force a command'
    },
    both = {
        name: 'both',
        aliases: ['b'],
        description: 'Deletes **both** the bots and the users messages'
    }
]

module.exports = {
    name: 'delete',
    description: 'Delete Mikaelas last message(s)',
    guildOnly: true,
    perms: ['admin'],
    flags: flags,
    aliases: ['dl'],

    async execute(message, args) {
        let flagsFound = getFlags(this.flags, args);

        let amount = 1
        let me = flagsFound.find(fg => fg.name === 'me');
        let force = flagsFound.find(fg => fg.name === 'force')
        let both = flagsFound.find(fg => fg.name === 'both')

        if (!both)
            amount = me === undefined ? args.shift() : me.args;
        else {
            amount = both.args !== undefined ? both.args : amount
            console.log(`Both flag called, amount: ${amount}`);
        }

        amount = amount === undefined ? 1 : amount;
        amount = amount !== undefined && me !== undefined && me.args === undefined ? 1 : amount

        if (amount === undefined) {
            console.log(`Amount is undefined`)
            const lastMessage = message.client.user.lastMessage;
            if (lastMessage) {
                console.log(`found last message ${lastMessage}`);
                lastMessage.delete();
            }
        }
        console.log(`Amount: ${amount}`)

        if (isNaN(amount)) return;

        if (!force) {
            if (amount < 1 || amount > 25) {
                return message.reply('`amount must be between 1 - 25`');
            }
        }

        amount++;

        await message.channel.fetchMessages({ limit: amount })
            .then(async messages => {
                let id = message.client.user.id
                let authorID = message.author.id
                let result = messages.filter(m => m.author.id === id)

                if (both && !me) {
                    result = messages.filter(m => m.author.id === authorID || m.author.id === id)
                } else if (me) {
                    result = messages.filter(m => m.author.id === authorID)
                }

                console.log(`Messages found: ${result.size}`);
                await message.channel.bulkDelete(result).then(dlt => {
                    console.log(`Deleted ${dlt.size}`);
                }).catch(err => {
                    console.error(`Error: ${err}`);
                })
            }).catch(err => {
                console.error(`Error: ${err}`);
            })

    }
}