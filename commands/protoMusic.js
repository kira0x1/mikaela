const fs = require('fs')
const { findSubCommand } = require('../util/commandUtil')
const youTubeKey = require('../config.json').keys.youTubeKey
const search = require('youtube-search')
const ytdl = require('ytdl-core')

const opts = {
    part: ['snippet', 'contentDetails'],
    maxResults: 1,
    key: youTubeKey,
}


const commandFiles = fs.readdirSync('./commands/music').filter(file => file.endsWith('.js'))
let subcommands = []

for (const file of commandFiles) {
    const command = require(`./music/${file}`)
    subcommands.push({ name: command.name, command: command })
}

module.exports = {
    name: 'proto',
    description: 'music prototype',
    aliases: ['mp'],
    usage: '<subcommand>',
    subcommands: subcommands,
    guildOnly: true,

    async execute(message, args) {
        let cmd = (findSubCommand(message.content.slice(1).split(/ +/)[0]))
        const song = await findVideoBylink(args.join(' '))

        async function searchVideo(query) {
            await search(query, opts)
                .then(data => {
                    song = data.results[0]
                    console.log(song.link, song.title)
                })
                .catch(() => {
                    console.log(`**Couldnt find video:** *${query}*`)
                })
        }

        async function findVideoBylink(query) {
            //Check if its a link
            await ytdl
                .getBasicInfo(query)
                .then(song => {
                    title = song.title
                    url = song.video_url
                    console.log(`Found song: ${title}`)
                })
                .catch(err => {
                    searchVideo(query)
                }) //If not link then search
        }
    }
}