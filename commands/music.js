const discord = require('discord.js')
const search = require('youtube-search')
const { usage } = require('../util/util')

const searchOptions = {
    part: ['snippet', 'contentDetails'],
    chart: 'mostPopular',
    maxResults: 1,
    key: 'AIzaSyAQ_I6nDdIahO4hWerAQ32P4UXFf21_ELo',
};

const streamOptions = {
    volume: 0.8,
    passes: 3
}

const ytdl = require('ytdl-core')
var conn
var currentSong

const { prefix } = require('../config.json');

const flags = [
    pause = { name: 'pause', aliases: ['pause', 'hold', 'ps'] },
    exit = { name: 'exit', aliases: ['stop', 'quit', 'lv', 'leave'] },
    resume = { name: 'resume', aliases: ['resume', 'rs',] },
    skip = { name: 'skip', aliases: ['sk', 'fs'] },
    queueFlag = { name: 'queue', aliases: ['q', 'list'] },
    current = { name: 'current', aliases: ['np'] }
]

let queue = []

class songInfo {
    constructor(link, title) {
        this.link = link
        this.title = title
    }
}

module.exports = {
    name: 'music',
    aliases: ['p', 'play', 'start', 'leave', 'lv', 'stop', 'quit', 'pause', 'exit', 'search', 'hold',
        'resume', 'r', 'fs', 'skip', 'sk', 'np', 'playing', 'q', 'queue', 'list'
    ],
    guildOnly: true,
    usage: `[link | search] or [flag]`,
    cooldown: 3,
    description: `Plays music via links or youtube searches`,

    execute(message, args) {

        //For now hard coding channel id
        // arg = args.shift()
        query = args.join(' ')
        arg = message.content.slice(prefix.length).split(/ +/).shift()

        const vc = message.member.voiceChannel

        let flag = flags.find(f => f.name === arg) || flags.find(f => f.aliases && f.aliases.includes(arg))
        status = 'play'

        if (flag) {
            if (flag.name === 'exit') {
                status = 'end'
                stop()
            }
            else if (flag.name === 'pause') {
                pause()
            }
            else if (flag.name === 'resume') {
                resume()
            }
            else if (flag.name === 'skip') {
                status = 'skip'
                playNext()
            }
            else if (flag.name === 'queue') {
                showQueue()
            }
            else if (flag.name === 'current') {
                nowPlaying()
            }
            return
        }

        if (!flag && !query)
            return reply(usage(this))

        if (!vc)
            return reply('You\'re not in a vc')


        //Check if its a link
        ytdl.getBasicInfo(query)
            .then(song => addSong(song.video_url, song.title, song.length_seconds / 60))
            .catch(err => {
                //If not link then search
                findVideo(query)
            })

        //Search Function
        function findVideo(query) {
            search(query, searchOptions).then(data => {
                song = data.results[0]
                addSong(song.link, song.title)
            }).catch( () => {
                reply(`**Couldnt find video:** *${query}*`)
            })
        }

        //Play Function
        function play() {
            currentSong = queue[0]
            let url = currentSong.link

            vc.join().then(connection => {
                const stream = ytdl(url, { filter: 'audioonly' })
                const dispatcher = connection.playStream(stream, streamOptions)

                conn = dispatcher
                dispatcher.on('end', reason => onSongFinished(reason))
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
            if (reason !== 'user' && reason !== undefined) {
                playNext()
            }
        }

        function playNext() {
            let song = queue.pop()

            if (queue.length === 0 || !song) {
                stop()
                return
            }

            play()
        }

        function addSong(link, title) {
            queue.push(new songInfo(link, title))
            reply(`Added song: **${title}** to queue`)
            if (currentSong === undefined) play()
        }

        function pause() {
            if (conn && currentSong) {
                reply(`Paused: ${currentSong.title}`)
                conn.pause()
            }
        }

        function stop() {
            if (!conn) return

            conn.end()
            currentSong = undefined
            queue = []
            vc.leave()
        }

        function nowPlaying() {
            if (currentSong) {
                embed = new discord.RichEmbed()
                    .setTitle('Currently Playing')
                    .addField(currentSong.title, currentSong.link)

                reply('', { embed: embed })
            } else {
                reply(`No song is playing right now...`)
            }
        }

        function showQueue() {
            if (currentSong === undefined && (queue.length === 0 || queue === undefined)) {
                return reply(`Queue empty...`)
            }

            embed = new discord.RichEmbed()
                .setTitle('Queue\nCurrently Playing: ' + currentSong.title)

            for (let i = 0; i < queue.length; i++) {
                embed.addField(i + 1, queue[i].title + '\n' + queue[i].link)
            }

            reply('', { embed: embed })
        }

        function reply(content, options) {
            message.reply(content, options)
        }
    }
}