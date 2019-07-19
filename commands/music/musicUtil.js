const ytdl = require('ytdl-core')
const { Search } = require('./youtube')
class Song {
    constructor(title, url, duration) {
        this.title = title
        this.url = url
        this.duration = duration
    }
}

module.exports = {
    async GetSong(query) {
        let song = await this.GetInfo(query)

        if (!song) {
            id = await Search(query).then(res => res.id.videoId)
            link = this.ConvertId(id)
            song = await this.GetInfo(link)
        }

        return this.ConvertToSong(song)
    },

    async GetInfo(link) {
        return await ytdl.getInfo(link).catch(() => { })
    },

    ConvertToSong(info) {
        return new Song(info.title, info.video_url, info.length_seconds)
    },

    //ANCHOR returns a link from a video id
    ConvertId(id) {
        return `https://www.youtube.com/watch?v=${id}`
    }
}