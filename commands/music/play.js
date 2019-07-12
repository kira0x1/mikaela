const { getBasicInfo } = require('ytdl-core')

module.exports = {
    name: 'play',
    description: 'plays music',
    usage: `[link | search] or [alias]`,

    AddSong(url) {
        const song = getBasicInfo(url).then(song).catch(err => console.error(err))
        console.log(song)
    }
}