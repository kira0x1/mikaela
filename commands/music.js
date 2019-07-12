const discord = require('discord.js')
const search = require('youtube-search')
const ytdl = require('ytdl-core')
// const ytdlDiscord = require('ytdl-core-discord')
const config = require('../config.json')
const fs = require('fs')
const prefix = config.prefix
const youTubeKey = config.keys.youTubeKey
const { getFlags } = require('../util/util')


const searchOptions = {
  part: ['snippet', 'contentDetails'],
  chart: 'mostPopular',
  maxResults: 1,
  key: youTubeKey,
}

//bitrate: '120000',
const streamOptions = {
  passes: 2,
  type: 'opus',
  seek: 0
}

var conn
var currentSong
var queue = []
var status = 'skip'
var isPlaying = false

const commandFiles = fs.readdirSync('./commands/music').filter(file => file.endsWith('.js'))
let subcommands = []

for (const file of commandFiles) {
  const command = require(`./music/${file}`)
  subcommands.push({ name: command.name, command: command })
}

const commands = [
  (play = { name: 'play', aliases: ['play', 'p', 'music'] }),
  (pause = { name: 'pause', aliases: ['pause', 'hold', 'ps'] }),
  (leave = { name: 'leave', aliases: ['stop', 'exit', 'quit', 'lv', 'leave'] }),
  (resume = { name: 'resume', aliases: ['resume', 'rs'] }),
  (skip = { name: 'skip', aliases: ['skip', 'sk', 'fs'] }),
  (queuecmd = { name: 'queue', aliases: ['queue', 'q', 'list'] }),
  (current = { name: 'current', aliases: ['current', 'np'] }),
  (remove = { name: 'remove', aliases: ['remove', 'r', 'rm', 'rmv'] }),
]

const aliases = [
  (seek = {
    name: 'seek',
    description: '',
    aliases: ['s', 't', 'time']
  })
]
// commands.map(f => f.aliases),

module.exports = {
  name: 'music',
  subcommands: subcommands,
  aliases: [] + commands.map(cmd => cmd.aliases),
  guildOnly: true,
  usage: `[link | search] or [alias]`,
  cooldown: 3,
  description: `Plays music via links or youtube searches`,

  execute(message, args) {
    const query = args.join(' ')

    const arg = message.content
      .slice(prefix.length)
      .split(/ +/)
      .shift()

    const vc = message.member.voiceChannel
    let cmd = commands.find(f => f.name === arg) || commands.find(f => f.aliases && f.aliases.includes(arg))

    let flags = getFlags(aliases, args)
    let seek = flags.find(sk => sk.name === 'seek')
    if (seek) streamOptions.seek = seek.args

    if (cmd && cmd.name) {
      switch (cmd.name) {
        case 'play':
          play()
          break

        case 'leave':
          status = 'stop'
          stop()
          break

        case 'pause':
          pause()
          break
        case 'resume':
          resume()
          break

        case 'skip':
          status = 'skip'
          playNext()
          break

        case 'queue':
          showQueue()
          break

        case 'current':
          nowPlaying()
          break

        case 'remove':
          removeSong()
          break
      }
    }


    //Search Function
    async function searchVideo() {
      await search(query, searchOptions)
        .then(data => {
          song = data.results[0]
          addSong(song.link, song.title)
        })
        .catch(err => {
          send(`**Couldnt find video:** *${query}*`)
        })
    }

    async function findVideoBylink() {
      //Check if its a link
      await ytdl
        .getBasicInfo(query)
        .then(song => {
          title = song.title
          url = song.video_url
          addSong(url, title)
        })
        .catch(err => {
          searchVideo(query)
        }) //If not link then search
    }

    //Play Function
    function play() {
      status = ''
      if (!vc) return send("You're not in a vc")
      if (!query) {
        if (conn) {
          if (conn.ispaused) conn.resume
        }
        return
      }
      findVideoBylink()
    }

    async function PlaySong() {
      let url = currentSong.link
      await vc.join().then(async connection => {
        if (!url) return
        isPlaying = true
        const stream = await ytdl(url, { filter: 'audioonly' })
        const dispatcher = await connection.playStream(stream, streamOptions)
        conn = dispatcher
        dispatcher.on('end', () => onSongFinished())
      })
    }

    function resume() {
      if (conn && currentSong) {
        if (!conn.paused) return send('Song is currently not paused')
        send('resuming!')
        isPlaying = true
        conn.resume()
      } else {
        send('No song to resume')
      }
    }

    function onSongFinished() {
      if (status === 'stop') return stop()
      playNext()
    }

    function playNext() {
      status = ''
      if (queue.length === 0) {
        return stop()
      }

      let song = queue.shift()
      if (song) {
        currentSong = song
        PlaySong()
      }
    }

    function addSong(link, title) {
      queue.push({ link, title })
      send(`Added song: **${title}** to queue`)
      if (!currentSong) playNext()
    }

    function pause() {
      if (conn && currentSong) {
        isPlaying = false
        send(`Paused: ${currentSong.title}`)
        conn.pause()
      }
    }

    function stop() {
      isPlaying = false
      queue = []
      currentSong = undefined
      vc.leave()
    }

    function removeSong() {
      let hasQ = showQueue()
      if (hasQ === false) return

      send('`Enter songs position: `')

      const filter = m => m.content.length >= 1 && !isNaN(m.content)
      const collector = message.channel.createMessageCollector(filter, { time: 6000 })

      collector.on('collect', m => {
        let qid = m.content

        if (qid < 1 || qid > queue.length + 1) {
          collector.stop()
          return send('No song in that position!')
        }
        if (qid === 1) {
          playNext()
        } else {
          qid--
          queue.splice(qid, 1)
        }
      })
    }

    function nowPlaying() {
      if (currentSong) {
        let embed = new discord.RichEmbed()
          .setTitle('Currently Playing')
          .addField(currentSong.title, currentSong.link)
          .setColor(0xc71459)

        send(embed)
      } else {
        send(`No song is playing right now...`)
      }
    }

    function showQueue() {
      if (!hasQueue() && currentSong === undefined) {
        send(`Queue empty...`)
        return false
      }
      let embed = new discord.RichEmbed()
        .setTitle('Queue\nCurrently Playing: ' + currentSong.title)
        .setColor(0xc71459)

      for (let i = 0; i < queue.length; i++) {
        embed.addField(i + 1, queue[i].title + '\n' + queue[i].link)
      }
      send(embed)
      return true
    }

    function hasQueue() {
      return !(queue.length === 0 || queue === undefined)
    }

    function send(content) {
      message.channel.send(content)
    }
  },
}
