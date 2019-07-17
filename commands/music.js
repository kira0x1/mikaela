const config = require('../config.json')
const prefix = config.prefix
const ytdl = require('ytdl-core')
const queue = require('./music/queue')

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
      await queue.AddSong(song, message)
    }).catch(err => console.log(err))

  },
}
