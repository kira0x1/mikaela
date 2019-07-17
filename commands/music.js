const { prefix } = require('../config.json')
const ytdl = require('ytdl-core')
const que = require('./music/queue')
const stream = require('./music/stream')
const search = require('./music/youtube')

//ANCHOR Sub Commands
const fs = require('fs')
const { findSubCommand } = require('../util/commandUtil')
const { getAlias } = require('../util/util')
const commandFiles = fs.readdirSync('./commands/music').filter(file => file.endsWith('.js'))
let subcommands = []

for (const file of commandFiles) {
  const command = require(`./music/${file}`)
  subcommands.push({ name: command.name, command: command })
}

module.exports = {
  name: 'music',
  usage: `[link | search]`,
  cooldown: 3,
  description: `Plays music via links or youtube searches`,
  aliases: ['play', 'p'],
  args: true,
  guildOnly: true,
  subcommands: subcommands,


  async execute(message, args) {


    if (!getAlias(this.aliases, message.content)) {
      const arg = message.content
        .slice(prefix.length)
        .split(/ +/)
        .shift()

      //NOTE if a subcommand is found in the message, then call the subcommand and exit out 
      cmd = findSubCommand(arg)
      if (cmd) return await cmd.execute(message, args)
    }
    //NOTE  Get Query
    const query = args.join(' ')
    const song = await FindSong(query)

    if (!song) return message.channel.send(`Couldnt find video: **${query}**`)
    await this.PlaySong(message, song)

    //ANCHOR Find Song
    async function FindSong(query) {
      let song = undefined

      //NOTE GetSong: URL
      song = ytdl.getBasicInfo(query).catch(err => {
        //NOTE
        //If failed then assume the user gave a query not a link
        //Try to search instead...

        //ANCHOR GetSong: Searchs
        song = search.Search(query)
      })

      return song
    }
  },

  //ANCHOR Play Song
  async PlaySong(message, song) {
    await que.AddSong(song, message)
    if (que.GetCurrentSong() === undefined) {
      stream.playSong(message, que.shiftNextSong())
    }
  }
}
