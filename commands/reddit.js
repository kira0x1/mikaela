const randomPuppy = require('random-puppy');
const util = require('../util/util')
const Discord = require('discord.js');

const subreddits = [
    yaoi = { name: "yaoi", sub: "yaoi", aliases: [] },
    rule34 = { name: "rule34", sub: "rule34", aliases: ['r34'] },
    furry = { name: "furry", sub: "yiffgif", aliases: ['furry', 'yiff'] },
]

module.exports = {
    name: 'reddit',
    usage: '<subreddit>',
    aliases: [] + subreddits.map(rd => rd.name) + subreddits.map(rd => rd.aliases),
    description: 'post pictures from a subreddit',
    flags: ['n'],
    guildOnly: true,
    args: false,

    execute(message, args) {
        if (!message.channel.nsfw) return message.channel.send("This isn't channel isnt NSFW!");
        let amount = 1
        var sub = subreddits.find(f => f.name === args[0]) || subreddits.find(f => f.aliases && f.aliases.includes(args[0]))

        if (sub) {
            console.log(`has args: ${args[0]}`)
            sub = sub.name
        }
        else {
            arg = message.content.slice(1).split(/ +/).shift()
            sub = subreddits.find(f => f.name === arg) || subreddits.find(f => f.aliases && f.aliases.includes(arg))

            if (sub)
                sub = sub.name
            else
                sub = subreddits[Math.round(Math.random() * (subreddits.length - 1))];
        }

        const flag = util.checkForFlags(this.flags, args)

        if (flag) {
            if (flag === 'n') {
                amount = args
                if (amount < 1 || amount > 10) {
                    return message.reply('Amount must be between 1 - 10')
                }
            }
        }

        return getSub(sub);


        function getSub(sub) {
            for (let i = 0; i < amount; i++) {
                randomPuppy(sub)
                    .then(url => {
                        const embed = new Discord.RichEmbed()
                            .setColor(0xd60b4f)
                            .setImage(url)
                        message.channel.send({ embed });
                    })
            }
        }
    }
}