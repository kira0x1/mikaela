const Discord = require('discord.js')
const fetch = require('node-fetch')

const { getFlags } = require('../util/util')

const maxpost = 5 //How many images to post
let searchLimit = 20 //Amount to request from the api

const checkWords = ['i.imgur.com', 'jpg', 'png', 'gif', 'gfycat.com', 'webm',]
const gyfwords = ['gfycat.com']

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
    let sort = 'hot'
    let time = 'all'
    let amount = 1

    //NOTE Set flags
    initFlags()

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

      //NOTE Create embed
      // const embed = createEmbed(data.title, data.url)
      //NOTE send message :)
      // if (embed)
      // await message.channel.send(embed)
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

    function getImage(url) {
      const domain = checkWords.find(word => url.includes(word))
      const isGifCat = gyfwords.find(word => url.includes(word))
      let urlText = undefined

      if (domain) {
        urlText = url
        if (isGifCat) {
          const gifcat = `http://.*gfycat.com/${url}`
          urlText = `http://giant.gfycat.com/${gifcat}.gif`
        }
      }

      return urlText
    }

    function createEmbed(title, url) {
      if (url === 'self') return

      const postImage = getImage(url)
      if (!postImage) return

      const embed = new Discord.RichEmbed()
        .setColor(0xc71459)
        .setTitle(title)
        .addField(
          '\nSort:',
          `
          ${sort}/${time}`
        )
        .setFooter(`From r/${subreddit}`)

      embed.setImage(postImage)
      return embed
    }

    function initFlags() {
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
    }
  },
}
