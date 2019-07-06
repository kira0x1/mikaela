const discord = require('discord.js')
const search = require('youtube-search')
const ytdl = require('ytdl-core')
const { prefix } = require('../config.json')

const searchOptions = {
  part: ['snippet', 'contentDetails'],
  chart: 'mostPopular',
  maxResults: 3,
  key: 'AIzaSyAQ_I6nDdIahO4hWerAQ32P4UXFf21_ELo',
}

const streamOptions = { volume: 0.3, passes: 3 }

let conn
let currentSong
let queue = []

const flags = [
  (play = { name: 'play', aliases: ['play', 'p'] }),
  (pause = { name: 'pause', aliases: ['pause', 'hold', 'ps'] }),
  (leave = { name: 'leave', aliases: ['stop', 'exit', 'quit', 'lv', 'leave'] }),
  (resume = { name: 'resume', aliases: ['resume', 'rs'] }),
  (skip = { name: 'skip', aliases: ['skip', 'sk', 'fs'] }),
  (queueFlag = { name: 'queue', aliases: ['queue', 'q', 'list'] }),
  (current = { name: 'current', aliases: ['current', 'np'] }),
  (remove = { name: 'remove', aliases: ['remove', 'r', 'rm', 'rmv'] }),
]

module.exports = {
  name: 'music',
  aliases: [] + flags.map(f => f.aliases),
  guildOnly: true,
  usage: `[link | search] or [flag]`,
  cooldown: 3,
  description: `Plays music via links or youtube searches`,

  execute(message, args) {
    const query = args.join(' ')

    const arg = message.content
      .slice(prefix.length)
      .split(/ +/)
      .shift()

    const vc = message.member.voiceChannel
    let flag = flags.find(f => f.name === arg) || flags.find(f => f.aliases && f.aliases.includes(arg))

    if (flag && flag.name) {
      switch (flag.name) {
        case 'play':
          play()
          break

        case 'leave':
          stop()
          break

        case 'pause':
          pause()
          break
        case 'resume':
          resume()
          break

        case 'skip':
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
    function searchVideo() {
      search(query, searchOptions)
        .then(data => {
          song = data.results[0]
          addSong(song.link, song.title)
        })
        .catch(err => {
          reply(`**Couldnt find video:** *${query}*`)
        })
    }

    function findVideoBylink() {
      //Check if its a link
      ytdl
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
      if (!vc) return reply("You're not in a vc")

      if (!query) {
        if (conn) {
          if (conn.ispaused) conn.resume
        }
        return
      }

      findVideoBylink()
    }

    function PlaySong() {
      let url = currentSong.link
      vc.join().then(connection => {
        if (conn) {
          if (conn.ispaused && currentSong !== undefined) conn.resume()
          return
        }

        if (url) {
          const stream = ytdl(url, { filter: 'audioonly' })
          const dispatcher = connection.playStream(stream, streamOptions)
          conn = dispatcher
          dispatcher.on('end', reason => onSongFinished(reason))
        }
      })
    }

    function resume() {
      if (conn && currentSong) {
        if (!conn.paused) return reply('Song is currently not paused')
        reply('resuming!')
        conn.resume()
      } else {
        reply('No song to resume')
      }
    }

    function onSongFinished(reason) {
      currentSong = undefined

      switch (reason) {
        case undefined:
          stop()
          break
        case 'user':
          playNext()
          break
      }
    }

    function playNext() {
      currentSong = queue.shift()

      if (currentSong) {
        PlaySong()
      } else {
        stop()
      }
    }

    function addSong(link, title) {
      queue.push({ link, title })

      reply(`Added song: **${title}** to queue`)
      if (!currentSong) playNext()
    }

    function pause() {
      if (conn && currentSong) {
        reply(`Paused: ${currentSong.title}`)
        conn.pause()
      }
    }

    function stop() {
      vc.leave()
      queue = []
      currentSong = undefined
      if (conn) conn.destroy()
    }

    function removeSong() {
      let hasQ = showQueue()
      if (hasQ === false) return

      reply('`Enter songs position: `')

      const filter = m => m.content.length >= 1 && !isNaN(m.content)
      const collector = message.channel.createMessageCollector(filter, { time: 6000 })

      collector.on('collect', m => {
        let qid = m.content
        console.log(`QID: ${qid}`)

        if (qid < 1 || qid > queue.length + 1) {
          console.log(`Value too low: input: ${qid} , length: ${queue.length}`)
          collector.stop()
          return reply('No song in that position!')
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

        reply(embed)
      } else {
        reply(`No song is playing right now...`)
      }
    }

    function showQueue() {
      if (!hasQueue() && !currentSong) {
        send(`Queue empty...`)
        return false
      }

      let embed = new discord.RichEmbed().setTitle('Queue\nCurrently Playing: ' + currentSong.title).setColor(0xc71459)

      for (let i = 0; i < queue.length; i++) {
        embed.addField(i + 1, queue[i].title + '\n' + queue[i].link)
      }

      send(embed)
      return true
    }

    function hasQueue() {
      return !(queue.length === 0 || queue === undefined)
    }

    function reply(content) {
      message.reply(content)
    }

    function send(content) {
      message.channel.send(content)
    }
  },
}
