const currency = require('./currency')

module.exports = {
    name: 'give',
    description: 'Give gold to someone',
    args: true,
    guildOnly: true,
    usage: ' \`<amount>\`',

    execute(message, args) {
        let target = message.mentions.users.first()
        let amount = Number(args.join()) || 1

        amount = target === undefined ? amount : args.slice(1).join()
        target = target === undefined ? message.author : target

        currency.add(target.id, amount)
        message.channel.send(`**${message.author.username}** has given **${target.tag}** ***+${amount} g***`)
    }   
}