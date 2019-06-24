const vcID = '585850878532124680';
const url = 'https://www.youtube.com/watch?v=YUyedpix0P8';

const discord = require('discord.js')
const search = require('youtube-search');

const searchOptions = {
    maxResults: 10,
    key: 'AIzaSyAQ_I6nDdIahO4hWerAQ32P4UXFf21_ELo',
};

const streamOptions = {
    volume: 0.5,
    passes: 3
}

const ytdl = require('ytdl-core')
var conn
const { prefix } = require('../config.json');


const flags = [
    pause = { name: 'pause', aliases: ['pause', 'hold', 'ps'] },
    exit = { name: 'exit', aliases: ['stop', 'quit', 'lv', 'leave'] },
    find = { name: 'find', aliases: ['search', 's', 'f'] },
    resume = { name: 'resume', aliases: ['resume', 'r'] }
]

module.exports = {
    name: 'play',
    aliases: ['p', 'play', 'start', 'leave', 'lv', 'stop', 'quit', 'pause', 'exit', 'search', 'hold',
        'resume', 'r'
    ],
    guildOnly: true,
    usage: `
    [link | search] or [flag]

    ${flags.map(f => f.name + ':\n'
        + '\t\t\t' + f.aliases)}
    `,
    cooldown: 1,
    description: `Plays music via links or youtube searches`,

    async execute(message, args) {

        //For now hard coding channel id
        // arg = args.shift()
        query = args.join(' ')
        arg = message.content.slice(prefix.length).split(/ +/).shift()

        const vc = message.member.voiceChannel

        if (!vc) {
            message.channel.send('You\'re not in a vc')
            return console.error('Youre not in a vc')
        }


        let flag = flags.find(f => f.name === arg) || flags.find(f => f.aliases && f.aliases.includes(arg))



        if (flag) {
            if (flag.name === 'exit') {
                if (conn) {
                    conn.destroy()
                }
                vc.leave()
                return
            }
            else if (flag.name === 'pause') {
                pause()
                return
            }
            else if (flag.name === 'resume') {
                resume()
                return
            }
        }
        else if (!flag && !query) {
            console.log('resuming..!')
            resume()
            return
        }


        if (!query) return

        //Check if its a link
        await ytdl.getBasicInfo(query).then(async song => {
            message.channel.send(`**playing:** *${song.title}*`);
            play(song)
        }).catch(err => {

            //If not link then search
            findVideo(query)
        })

        //Search Function
        async function findVideo(query) {

            search(query, searchOptions).then(data => {

                //Play song
                play(data.results[0])

            }).catch(err => {
                console.error(err)
                message.channel.send(`**Couldnt find video:** *${query}*`)
            })
        }

        //Play Function
        async function play(song) {
            const url = song.link

            const embed = new discord.RichEmbed()
                .setTitle('**Playing: **\n' + song.title)
                .setDescription(`Link: ${song.link}`)
                .setImage(song.thumbnails.default.url)

            message.channel.send('', { embed: embed })

            await vc.join().then(async connection => {
                const stream = await ytdl(url, { filter: 'audioonly' })
                const dispatcher = await connection.playStream(stream, streamOptions)

                conn = dispatcher
                dispatcher.on('end', () => vc.leave())
            })
        }

        function resume() {
            if (conn) {
                console.log('resuming')
                conn.resume()
            }
        }

        function pause() {
            if (conn) {
                console.log('pausing..')
                conn.pause()
            }
        }

    }
}