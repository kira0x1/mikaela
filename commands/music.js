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
    volume: 0.6,
    passes: 3
}

const ytdl = require('ytdl-core')
var conn
var currentSong

const { prefix } = require('../config.json');

const flags = [
    play = { name: 'play', aliases: ['play', 'p'] },
    pause = { name: 'pause', aliases: ['pause', 'hold', 'ps'] },
    exit = { name: 'exit', aliases: ['stop', 'exit', 'quit', 'lv', 'leave'] },
    resume = { name: 'resume', aliases: ['resume', 'rs',] },
    skip = { name: 'skip', aliases: ['skip', 'sk', 'fs'] },
    queueFlag = { name: 'queue', aliases: ['queue', 'q', 'list'] },
    current = { name: 'current', aliases: ['current', 'np'] },
    remove = { name: 'remove', aliases: ['remove', 'r'] }
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
    aliases: [] + flags.map(f => f.aliases),
    guildOnly: true,
    usage: `[link | search] or [flag]`,
    cooldown: 3,
    description: `Plays music via links or youtube searches`,

    async execute(message, args) {
        query = args.join(' ')
        arg = message.content.slice(prefix.length).split(/ +/).shift()

        const vc = await message.member.voiceChannel

        let flag = flags.find(f => f.name === arg) || flags.find(f => f.aliases && f.aliases.includes(arg))
        status = 'play'

        if (flag && flag.name !== 'play') {
            if (flag.name === 'exit') {
                status = 'end'
                await stop()
            }
            else if (flag.name === 'pause') {
                await pause()
            }
            else if (flag.name === 'resume') {
                await resume()
            }
            else if (flag.name === 'skip') {
                status = 'skip'
                await playNext()
            }
            else if (flag.name === 'queue') {
                await showQueue()
            }
            else if (flag.name === 'current') {
                await nowPlaying()
            }
            else if (flag.name === 'remove') {
                removeSong()
            }
            return
        }

        if (!query)
            return await reply(usage(this))

        if (!vc)
            return await reply('You\'re not in a vc')


        //Check if its a link
        await ytdl.getBasicInfo(query)
            .then(song => addSong(song.video_url, song.title, song.length_seconds / 60))
            .catch(err => {
                //If not link then search
                findVideo(query)
            })

        //Search Function
        async function findVideo(query) {
            await search(query, searchOptions).then(async data => {
                song = data.results[0]
                await addSong(song.link, song.title)
            }).catch(() => {
                reply(`**Couldnt find video:** *${query}*`)
            })
        }

        //Play Function
        async function play() {
            currentSong = queue[0]
            let url = currentSong.link

            await vc.join().then(async connection => {
                const stream = await ytdl(url, { filter: 'audioonly' })
                const dispatcher = await connection.playStream(stream, streamOptions)

                conn = dispatcher
                await dispatcher.on('end', reason => onSongFinished(reason))
            })
        }

        async function resume() {
            if (conn && currentSong) {
                if (!conn.paused) return reply('Song is currently not paused')

                reply('resuming!')
                await conn.resume()
            } else {
                reply('No song to resume')
            }
        }

        async function onSongFinished(reason) {
            if (reason !== 'user' && reason !== undefined) {
                await playNext()
            }
        }

        async function playNext() {
            let song = await queue.shift()

            if (queue.length === 0 || !song) {
                stop()
                return
            }

            await play()
        }

        async function addSong(link, title) {
            await queue.push(new songInfo(link, title))
            reply(`Added song: **${title}** to queue`)
            if (currentSong === undefined) await play()
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

        async function removeSong() {
            let songID = args[0]
            if (songID === undefined || isNaN(songID)) {

                let hasQ = await showQueue()
                if (hasQ === false) return;
                await reply('`Enter songs position: `');

                const filter = m => isNaN(m.content) === false;
                const collector = message.channel.createMessageCollector(filter, { time: 10000 });

                await collector.on('collect', async  m => {
                    collector.stop()

                    if (m < 1 || m > queue.length)
                        return reply('No song in that position!')

                    if (m === 1) {
                        return await playNext()
                    }
                    else {
                        m--
                        await queue.splice(m, 1)
                    }
                })
            }
        }

        async function nowPlaying() {
            if (currentSong) {
                embed = new discord.RichEmbed()
                    .setTitle('Currently Playing')
                    .addField(currentSong.title, currentSong.link)

                await reply('', { embed: embed })
            } else {
                await reply(`No song is playing right now...`)
            }
        }

        async function showQueue() {
            if (!hasQueue()) {
                await send(`Queue empty...`)
                return false
            }

            embed = new discord.RichEmbed()
                .setTitle('Queue\nCurrently Playing: ' + currentSong.title)

            for (let i = 0; i < queue.length; i++) {
                await embed.addField(i + 1, queue[i].title + '\n' + queue[i].link)
            }

            await send(embed)
            return true
        }

        function hasQueue() {
            return !(queue.length === 0 || queue === undefined)
        }

        async function reply(content) {
            await message.reply(content)
        }

        async function send(content) {
            await message.channel.send(content)
        }
    }
}