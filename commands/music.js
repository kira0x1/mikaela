const config = require('../config.json')
const prefix = config.prefix
const ytdl = require('ytdl-core')

const que = require('./music/queue')
const stream = require('./music/stream')

//NOTE Remove after developing 
const chalk = require('chalk')

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

    cmd = findSubCommand(arg)
    if (cmd) return await cmd.execute(message, args)

    const query = args.join(' ')
    await ytdl.getBasicInfo(query).then(async song => {
      await que.AddSong(song, message)

      if (que.GetCurrentSong() === undefined) {
        stream.playSong(message, que.shiftNextSong())
        //NOTE Remove after developing
        console.log(chalk`{magenta Playing next..}`)
      }
    }).catch(err => console.log(err))
  },


  async playSong(message, song) {
    await stream.playSong(message, song)
  }
}
