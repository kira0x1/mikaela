const { findSubCommand } = require('../util/commandUtil')
const que = require('../subcommands/music_commands/queue')
const stream = require('../subcommands/music_commands/stream')
const { getAlias } = require('../util/util')
const musicUtil = require('../subcommands/music_commands/musicUtil')
const { quickEmbed } = require('../util/embedUtil')

//Subcommands
const fs = require('fs')
const commandFiles = fs.readdirSync('./subcommands/music_commands').filter(file => file.endsWith('.js'))
let subcommands = []

for (const file of commandFiles) {
  const command = require(`../subcommands/music_commands/${file}`)
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

    //Get Query
    const query = args.join(' ')
    const song = await musicUtil.GetSong(query)

    if (!song) return quickEmbed(`Couldnt find video: **${query}**`)
    await this.PlaySong(message, song)
  },

  //ANCHOR Play Song
  async PlaySong(message, song) {
    //Add song to queue
    await que.AddSong(song, message)

    //Check if there is a song currently playing
    if (que.GetCurrentSong() === undefined) {
      //If no current song, play the song.
      stream.playSong(message, que.shiftNextSong())
    }
  }
}
