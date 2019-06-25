const superagent = require('superagent')

module.exports = {
    name: 'lewd',
    aliases: ['ld'],
    perms: ['admin'],
    aliases:
        ['hass', 'hmidriff', 'pgif', '4k', 'hentai', 'holo',
            'hneko', 'neko', 'hkitsune', 'kemonomimi', 'anal',
            'hanal', 'gonewild', 'kanna', 'ass', 'pussy', 'thigh', 'hthigh', 'gah', 'coffee', 'food'],

    async execute(message, args) {
        const al = this.aliases.find(a => message.content.startsWith('.' + a))
        
        let search = 'hentai'

        if (al)
            search = al

        if (message.channel.nsfw === true) {
            await superagent.get('https://nekobot.xyz/api/image')
                .query({ type: search })
                .then(result => {
                    message.channel.send({ file: result.body.message });
                }).catch(err => {
                    message.channel.reply(`${err}`)
                })
        } else {
            message.channel.send("This isn't NSFW channel!")
        }
    }
}