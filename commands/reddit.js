const fetch = require('node-fetch')
const { getFlags, getFlagArgs } = require('../util/util')
const { getThumbsDown, getThumbsUp } = require('../util/emojis')

const maxpost = 5 //How many images to post
let defaultLimit = 50
let searchLimit = 50 //Amount to request from the api

const flags = [
  (name = { name: 'sort', aliases: ['top', 'hot', 'new', 'controversial', 'rising'] }),
  (time = { name: 'time', aliases: ['year', 'month', 'week', 'day', 'all'] }),
  (amount = { name: 'amount', aliases: ['n'] }),
  (rank = { name: 'rank', aliases: ['r', '#'] }),
]

module.exports = {
  name: 'reddit',
  description: 'Posts from subreddits',
  aliases: ['r', 'rd'],
  flags: flags,
  usage: ` \`<subreddit>\` \`-sort\` \`-time\` \`-amount\` \`-rank\``,
  guildOnly: true,
  args: true,

  async execute(message, args) {
    const subreddit = args[0]
    let flagsFound = getFlags(flags, args)

    //NOTE Set flags
    let sort = getFlagArgs(flagsFound, 'sort', 'top')
    let amount = getFlagArgs(flagsFound, 'amount', 1)
    let time = getFlagArgs(flagsFound, 'time', 'all')
    let rank = getFlagArgs(flagsFound, 'rank', -1)


    //NOTE Make sure amount is within range
    if (amount < 1 || amount > maxpost) {
      return message.channel.send(`\`amount must be between 1-${maxpost}\``)
    }

    //NOTE Make sure rank is within range
    if (amount < 0 || rank > defaultLimit) {
      return message.channel.send(`\`amount must be between 0-${defaultLimit}\``)
    }

    if (rank !== -1) {
      searchLimit = rank
    }
    else {
      searchLimit = defaultLimit
    }
    searchLimit++

    //NOTE  get subreddit
    const posts = await getRedditPost()
    if (!posts) return

    const reply = []

    //Add title subreddit
    const postData = posts[0].data
    if (!postData.ups) return subredditNotFound()

    // reply.push(`**${postData.subreddit_name_prefixed}**\n`)
    reply.push(`**Subreddit** *https://www.reddit.com/r/${postData.subreddit}*\n`)

    for (let i = 0; i < amount; i++) {
      //NOTE Get a random number
      let postNumber = Math.floor(Math.random() * posts.length)

      if (rank !== -1)
        postNumber = rank

      //NOTE Get post data
      const data = posts[postNumber].data
      if (!data) return

      const postString = `**${data.title}** *(${data.ups} upvotes)*  ${data.url}`
      reply.push(postString)
    }

    await message.channel.send(reply.join('\n'))

    async function getRedditPost() {
      const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?&t=${time}&limit=${searchLimit}`
      const result = await fetch(url).then(res => res.json())

      if (!result.data) {
        return subredditNotFound()
      }

      //NOTE If result.data.after is undefined/null then that usually means the subreddit doesnt exist
      if (!result.data.after) {
        return subredditNotFound();
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

    function subredditNotFound() {
      message.channel.send(`**Subreddit doesnt exist :<**`)
    }
  },
}