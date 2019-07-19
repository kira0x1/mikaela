const { findSubCommand } = require('../util/commandUtil')
const que = require('./music/queue')
const stream = require('./music/stream')
const { getAlias } = require('../util/util')
const musicUtil = require('./music/musicUtil')

//Subcommands
const fs = require('fs')
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
        .slice(1)
        .split(/ +/)
        .shift()

      //NOTE if a subcommand is found in the message, then call the subcommand and exit out 
      cmd = findSubCommand(arg)
      if (cmd) return await cmd.execute(message, args)
    }

    //NOTE  Get Query
    const query = args.join(' ')
    const song = await musicUtil.GetSong(query)

    if (!song) return message.channel.send(`Couldnt find video: **${query}**`)
    await this.PlaySong(message, song)
  },

  //ANCHOR Play Song
  async PlaySong(message, song) {
    await que.AddSong(song, message)
    if (que.GetCurrentSong() === undefined) {
      stream.playSong(message, que.shiftNextSong())
    }
  }
}
