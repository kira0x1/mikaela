const agent = require('superagent')

module.exports = {
    name: 'lewd',
    aliases: ['ld'],
    aliases:
        ['hass', 'hmidriff', 'pgif', '4k', 'hentai', 'holo',
            'hneko', 'neko', 'hkitsune', 'kemonomimi', 'anal',
            'hanal', 'gonewild', 'kanna', 'ass', 'pussy', 'thigh', 'hthigh', 'gah', 'coffee', 'food'],
    cooldown: 2,

    async execute(message, args) {
        const al = this.aliases.find(a => message.content.startsWith('.' + a))

        let search = 'hentai'

        if (al)
            search = al

        let noneNSFW = al === 'coffee' || al === 'food'

        if (message.channel.nsfw === true || noneNSFW) {
            await agent.get('https://nekobot.xyz/api/image')
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