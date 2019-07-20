const fetch = require('node-fetch')
const { getFlags, getFlagArgs } = require('../util/util')

const maxpost = 10 //How many images to post
let searchLimit = 30 //Amount to request from the api

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
    const subreddit = args[0]
    let flagsFound = getFlags(flags, args)

    //NOTE Set flags
    let sort = getFlagArgs(flagsFound, 'sort', 'hot')
    let amount = getFlagArgs(flagsFound, 'amount', 1)
    let time = getFlagArgs(flagsFound, 'time', 'all')

    //NOTE Make sure amount is within range
    if (amount < 1 || amount > maxpost) {
      return message.channel.send(`\`amount must be between 1-${maxpost}\``)
    }

    //NOTE  get subreddit
    const posts = await getRedditPost()
    if (!posts) return

    const reply = []

    for (let i = 0; i < amount; i++) {
      //NOTE Get a random number
      const randomnumber = Math.floor(Math.random() * posts.length)

      //NOTE Get post data
      const data = posts[randomnumber].data
      if (!data) return

      reply.push(`**${data.title}:** ${data.url}`)
    }

    message.channel.send(reply.join('\n'))

    async function getRedditPost() {
      const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?&t=${time}&limit=${searchLimit}`
      const result = await fetch(url).then(res => res.json())

      if (!result.data) {
        message.channel.send(`**Subreddit doesnt exist :<**`)
        return
      }

      //NOTE If result.data.after is undefined/null then that usually means the subreddit doesnt exist
      if (!result.data.after) {
        message.channel.send(`**Subreddit doesnt exist :<**`)
        return
      }

      const postChildren = result.data.children

      //NOTE Dont allow nsfw posts in nsfw channels
      const redditPost = message.channel.nsfw ? postChildren : postChildren.filter(post => !post.data.over_18)
      if (!redditPost.length) {
        message.channel.send('This is not a **NSFW** channel.')
        return
      }

      return postChildren
    }
  },
}
