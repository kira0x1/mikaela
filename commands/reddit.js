const Discord = require('discord.js')
const fetch = require('node-fetch')
const { getFlags } = require('../util/util')

const maxpost = 40
let limit = 40

const flags = [
  (name = { name: 'sort', aliases: ['top', 'hot', 'new', 'controversial', 'rising'] }),
  (time = { name: 'time', aliases: ['year', 'month', 'week', 'day', 'all'] }),
  (amount = { name: 'amount', aliases: ['n'] }),
  (rank = { name: 'rank', aliases: ['r', '#', 'rank'] }),
]

module.exports = {
  name: 'reddit',
  description: 'Posts from subreddits',
  aliases: ['rd'],
  flags: flags,
  usage: ` \`<subreddit>\` \`-sort\` \`-time\` \`-amount\``,
  guildOnly: true,
  args: true,

  async execute(message, args) {
    try {
      const subreddit = args[0]

      let flagsFound = getFlags(flags, args)
      let sort = 'top'
      let time = 'all'
      let amount = 1

      flagsFound.map(fg => {
        if (fg.args) {
          switch (fg.name) {
            case 'sort':
              sort = fg.args
              break
            case 'time':
              time = fg.args
              break
            case 'amount':
              amount = fg.args
              break
          }
        }
      })

      if (amount < 1 || amount > maxpost) {
        return message.channel.send(`\`amount must be between 1-${maxpost}\``)
      }

      const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?&t=${time}&limit=${limit}`

      const result = await fetch(url).then(res => res.json())
      if (!result.data) return message.channel.send(`Couldnt retrieve reddit posts :<`)
      const body = result.data.children

      console.log(`posts: ${body.length}`)

      const redditPost = message.channel.nsfw ? body : body.filter(post => !post.data.over_18)
      if (!redditPost.length) return message.channel.send('This is not a **NSFW** channel.')

      for (let i = 0; i < amount; i++) {
        const randomnumber = Math.floor(Math.random() * redditPost.length)
        const embed = new Discord.RichEmbed()
          .setColor(0xc71459)
          .setTitle(redditPost[randomnumber].data.title)
          .setImage(redditPost[randomnumber].data.url)
          .addField(
            '\nSort:',
            `
                    ${sort}/${time}`
          )
          .setFooter(`From r/${subreddit}`)
        message.channel.send(embed)
      }
    } catch (err) {
      return console.log(err)
    }
  },
}
