const vcID = '585850878532124680';
const url = 'https://www.youtube.com/watch?v=YUyedpix0P8';

const discord = require('discord.js')
const search = require('youtube-search');
const searchOptions = {
    maxResults: 10,
    key: 'AIzaSyAQ_I6nDdIahO4hWerAQ32P4UXFf21_ELo',
};


const ct = require('common-tags')
const ytdl = require('ytdl-core')

const { prefix } = require('../config.json');

const flags = [
    pause = { name: 'exit', aliases: ['pause', 'stop', 'quit', 'lv', 'leave'] },
    find = { name: 'find', aliases: ['search', 's', 'f'] }
]
module.exports = {
    name: 'play',
    aliases: ['p', 'play', 'start', 'leave', 'lv', 'stop', 'quit', 'pause', 'exit', 'search'],
    perms: ['admin'],
    guildOnly: true,
    usage: `
    [link | search] or [flag]

    ${flags.map(f => f.name + ':\n'
        + '\t\t\t' + f.aliases)}
    `,
    cooldown: 1,

    async execute(message, args) {

        //For now hard coding channel id
        // arg = args.shift()
        query = args.join(' ')
        arg = message.content.slice(prefix.length).split(/ +/).shift()

        console.log(`message: ${arg}`)
        const channel = message.client.channels.get(vcID)
        const vc = message.member.voiceChannel

        let flag = flags.find(f => f.name === arg) || flags.find(f => f.aliases && f.aliases.includes(arg))

        if (flag) {
            if (flag.name === 'exit') {
                vc.leave()
                return
            }
        }

        if (!vc) return console.error('Youre not in a vc')
        if (!query) return

        await ytdl.getBasicInfo(query).then(async song => {
            message.channel.send(`**playing:** *${song.title}*`);
            play(song)
        }).catch(err => {
            search(query, searchOptions).then(data => {
                console.log(ct.commaListsAnd`songs found: 
                ${data.results.map(video => video.title + ', ')}
                `)

                play(data.results[0])
            }).catch(err => {
                console.error(err)
                message.channel.send(`**Couldnt find video:** *${query}*`)
            })
        })

        async function play(song) {
            const url = song.link

            const embed = new discord.RichEmbed()
                .setTitle('**Playing: **\n' + song.title)
                .setDescription(`Link: ${song.link}`)
                .setImage(song.thumbnails.default.url)

            message.channel.send('', { embed: embed })

            await vc.join().then(async connection => {
                const stream = await ytdl(url, { filter: 'audioonly' })
                const dispatcher = await connection.playStream(stream)

                dispatcher.on('end', () => vc.leave())
            })
        }
    }
}