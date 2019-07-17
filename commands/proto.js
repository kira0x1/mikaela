//FIXME REMOVE THIS FILE BEFORE UPLOADING
const config = require('../config.json')
const music = require('./music')
const { getFlags } = require('../util/util')
const chalk = require('chalk')
const mg = chalk.magenta
const blue = chalk.blue
const youtube = require('youtube-api')
const youTubeKey = config.keys.youTubeKey
const search = require('./music/youtube')

youtube.authenticate({
    type: "key",
    key: youTubeKey
})

const flags = [
    (amount = { name: 'amount', aliases: ['n'] }),
    (duration = { name: 'duration', aliases: ['d'] })
]

module.exports = {
    name: 'proto',
    description: 'prototype class used for testing and development',
    perms: ['admin'],
    usage: ' ',
    flags: flags,
    aliases: ['pr'],

    async execute(message, args) {
        const query = args.join(' ')
        const flags = getFlags(this.flags, args)

        let amount = flags.find(fl => fl.name === 'amount')
        const site = 'https://www.youtube.com/watch?v=j1tDDZB0Pl0'

        if (amount !== undefined) {
            for (let i = 0; i < amount.args; i++) {
                await music.PlaySong(message, site)
            }
        } else {
            const video = await search.GetVideo(query)
            log(`Qvideo: ${video}`)

            // const id = await search.Search(query).then(res => res.id.videoId)
            //     .catch(err => console.log(err))

            // console.log(`id: ${id}`)
            // await search.GetVideo(id).then(video => {
            //     log(`Video!`)
            //     log(JSON.stringify(video))
            // }).catch(err => console.log(err))
        }
        // const voice = message.client.voice.connections.map(vc => console.dir(`vc: ${vc}`))
        function log(msg, color = blue) {
            console.log(color(msg))
        }
    },


}