const Discord = require("discord.js");
const snekfetch = require("snekfetch");
const { getFlags } = require('../util/util')
const ct = require('common-tags')

const flags = [
    name = { name: 'sort', aliases: ['top', 'hot', 'new', 'controversial', 'rising'] },
    time = { name: 'time', aliases: ['year', 'month', 'week', 'day', 'all'] },
    amount = { name: 'amount', aliases: ['n'] }
]

module.exports = {
    name: 'reddit',
    description: 'Posts from subreddits',
    aliases: ['rd'],
    flags: flags,
    usage: `\`<subreddit> -sort -time -amount\`\n\n**Flags:** ${flags.map(f => `\n\t\t**` + f.name + '**: ' + f.aliases)}\n`,
    guildOnly: true,
    args: true,

    async execute(message, args) {
        try {
            const subreddit = args[0];
            let flagsFound = getFlags(flags, args);

            let sort = flagsFound.find(fg => fg.name === 'sort')
            let time = flagsFound.find(fg => fg.name === 'time');
            let amount = flagsFound.find(fg => fg.name === 'amount')

            sort = sort === undefined ? 'top' : sort.args
            time = time === undefined ? 'all' : time.args
            amount = amount === undefined ? 1 : amount.args

            if (amount < 1 || amount > 5) {
                return message.reply('\`amount must be between 1-5\`')
            }

            const { body } = await snekfetch
                .get(`https://www.reddit.com/r/${subreddit}/${sort}.json?&t=${time}`)
                .query({ limit: 800 });
            const allowed = message.channel.nsfw
                ? body.data.children
                : body.data.children.filter(post => !post.data.over_18);
            if (!allowed.length)
                return message.channel.send(
                    "Cannot post NSFW content in an NSFW channel"
                );
            for (let i = 0; i < amount; i++) {
                const randomnumber = Math.floor(Math.random() * allowed.length);
                const embed = new Discord.RichEmbed()
                    .setColor(0x00a2e8)
                    .setTitle(allowed[randomnumber].data.title)
                    .setImage(allowed[randomnumber].data.url)
                    .addField('\nSort:'
                        , `${sort} / ${time}`)
                    .setFooter(`From r/${subreddit}`);
                message.channel.send(embed);
            }
        } catch (err) {
            return console.log(err);
        }
    }
}