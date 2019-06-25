const discord = require('discord.js')
const search = require('youtube-search');
const chalk = require('chalk')

const searchOptions = {
    maxResults: 1,
    key: 'AIzaSyAQ_I6nDdIahO4hWerAQ32P4UXFf21_ELo',
};

const streamOptions = {
    volume: 1,
    passes: 0
}

const ytdl = require('ytdl-core')
var conn
var currentSong
let status = ''

const { prefix } = require('../config.json');


const flags = [
    pause = { name: 'pause', aliases: ['pause', 'hold', 'ps'] },
    exit = { name: 'exit', aliases: ['stop', 'quit', 'lv', 'leave'] },
    resume = { name: 'resume', aliases: ['resume', 'r', 'play'] },
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

    async execute(message, args) {

        //For now hard coding channel id
        // arg = args.shift()
        query = args.join(' ')
        arg = message.content.slice(prefix.length).split(/ +/).shift()

        const vc = message.member.voiceChannel

        let flag = flags.find(f => f.name === arg) || flags.find(f => f.aliases && f.aliases.includes(arg))
        status = 'play'

        if (flag) {
            // console.log(chalk.magenta(`flag: ${flag.name}`))

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
        else if (!flag && !query) {
            return
        }

        if (!vc) {
            return message.channel.send('You\'re not in a vc')
        }

        //Check if its a link
        ytdl.getBasicInfo(query).then(song => {
            message.channel.send(`**playing:** *${song.title}*`);
            addSong(song.video_url, song.title)
        }).catch(err => {
            //If not link then search
            findVideo(query)
        })

        //Search Function
        async function findVideo(query) {
            search(query, searchOptions).then(data => {
                song = data.results[0]
                addSong(song.link, song.title)
            }).catch(err => {
                message.channel.send(`**Couldnt find video:** *${query}*`)
            })
        }

        //Play Function
        async function play() {
            currentSong = queue.pop()
            let url = currentSong.link

            // const embed = new discord.RichEmbed()
            //     .setTitle('**Playing: **\n' + song.title)
            //     .setDescription(`Link: ${song.link}`)
            //     .setImage(song.thumbnails.default.url)
            // message.channel.send('', { embed: embed })


            await vc.join().then(async connection => {
                const stream = await ytdl(url, { filter: 'audioonly' })
                const dispatcher = await connection.playStream(stream, streamOptions)

                conn = dispatcher
                dispatcher.on('end', reason => onSongFinished(reason))
            })
        }

        function resume() {
            if (conn && currentSong) {
                message.channel.send('resuming!')
                conn.resume()
            }
        }

        function onSongFinished(reason) {
            if (reason !== 'user') {
                playNext()
            }
        }

        function playNext() {
            if (queue.length === 0) {
                console.log(chalk.magenta('No song next...'))
                stop()
                return
            }
            console.log(chalk.magenta('Has song!'))
            play()
        }

        function addSong(link, title) {
            queue.push(new songInfo(link, title))
            if (currentSong === undefined) play()
        }

        function pause() {
            if (conn && currentSong) {
                message.channel.send('paused..')
                conn.pause()
            }
        }

        async function stop() {
            await conn.end()
            currentSong = undefined
            queue = []
            await vc.leave()
        }

        function nowPlaying() {
            if (currentSong) {
                message.channel.send(`Playing: ${currentSong.title}`)
            } else {
                message.channel.send(`Not playing a song right now...`)
            }
        }

        function showQueue() {
            if (currentSong === undefined && (queue.length === 0 || queue === undefined)) {
                return message.channel.send(`Queue empty...`)
            }

            embed = new discord.RichEmbed()
                .setTitle('Queue\nCurrently Playing: ' + currentSong.title)

            for (let i = 0; i < queue.length; i++) {
                embed.addField(i + 1, queue[i].title + '\n' + queue[i].link)
            }

            // queue.map(s => {
            // embed.addField(s.title, s.link)
            // embed.addBlankField()
            // })

            message.channel.send('', { embed: embed })
        }
    }
}