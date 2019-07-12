const { getBasicInfo } = require('ytdl-core')
const youTubeKey = require('../../config.json').keys.youTubeKey
const search = require('youtube-search')

const opts = {
    part: ['snippet', 'contentDetails'],
    maxResults: 5,
    key: youTubeKey,
}


module.exports = {
    name: 'play',
    description: 'plays music',
    usage: `[link | search] or [alias]`,
    aliases: ['p', 'play'],

    async FindSong(query) {
    },

    //ANCHOR Gets song by url
    async getSong(url) {
        let song = await getBasicInfo(url).then(song => song).catch(err => { })
        return song
    },

    //Search Function
    async searchVideo(query) {
        await search(query, opts)
            .then(data => {
                song = data.results[0]
                addSong(song.link, song.title)
            })
            .catch(err => {
                console.log(`**Couldnt find video:** *${query}*`)
            })
    },
}
