const { usage, getFlags } = require('../util/util')

const flags = [
    me = {
        name: 'me',
        aliases: ['m']
    },
    force = {
        name: 'force',
        aliases: ['f']
    }
]

module.exports = {
    name: 'delete',
    description: 'Delete Mikaelas last message(s)',
    guildOnly: true,
    perms: ['admin'],
    flags: flags,
    aliases: ['dl'],

    execute(message, args) {
        let flagsFound = getFlags(this.flags, args);

        let me = flagsFound.find(fg => fg.name === 'me');
        let force = flagsFound.find(fg => fg.name === 'force')

        let amount = me === undefined ? args.shift() : me.args;

        if (amount === undefined) {
            const lastMessage = message.client.user.lastMessage;

            if (lastMessage) {
                console.log(`found last message ${lastMessage}`);
                lastMessage.delete();
            }
        }

        if (isNaN(amount)) return;

        if (!force) {
            if (amount < 1 || amount > 25) {
                return message.reply('`amount must be between 1 - 25`');
            }
        }

        amount++;

        message.channel.fetchMessages({ limit: amount })
            .then(messages => {
                let id = me === undefined ? message.client.user.id : message.author.id;
                let result = messages.filter(m => m.author.id === id)
                console.log(`Messages found: ${result.size}`);
                message.channel.bulkDelete(result).then(dlt => {
                    console.log(`Deleted ${dlt.size}`);
                }).catch(err => {
                    console.error(`Error: ${err}`);
                })
            }).catch(err => {
                console.error(`Error: ${err}`);
            })

    }
}