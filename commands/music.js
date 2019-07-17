const { prefix } = require('../config.json')
const ytdl = require('ytdl-core')
const que = require('./music/queue')
const stream = require('./music/stream')
const search = require('./music/youtube')


//ANCHOR Sub Commands
const fs = require('fs')
const { findSubCommand } = require('../util/commandUtil')
const commandFiles = fs.readdirSync('./commands/music').filter(file => file.endsWith('.js'))
let subcommands = []

for (const file of commandFiles) {
  const command = require(`./music/${file}`)
  subcommands.push({ name: command.name, command: command })
}

module.exports = {
  name: 'music',
  guildOnly: true,
  usage: `[link | search]`,
  cooldown: 3,
  description: `Plays music via links or youtube searches`,
  aliases: ['play', 'p'],
  subcommands: subcommands,

  async execute(message, args) {
    const arg = message.content
      .slice(prefix.length)
      .split(/ +/)
      .shift()

    //NOTE if a subcommand is found in the message, then call the subcommand and exit out 
    cmd = findSubCommand(arg)
    if (cmd) return await cmd.execute(message, args)

    //NOTE  Get Query
    const query = args.join(' ')
    await this.PlaySong(message, query)

    async function FindSong(query) {

    }
  },

  async PlaySong(message, query) {
    //ANCHOR GetSong: URL
    await ytdl.getBasicInfo(query).then(async song => {
      await que.AddSong(song, message)
      if (que.GetCurrentSong() === undefined) {
        stream.playSong(message, que.shiftNextSong())
      }
    }).catch(err => console.log(err))
  }
}
