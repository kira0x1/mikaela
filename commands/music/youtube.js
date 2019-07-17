const config = require('../../config.json')
const youtube = require('youtube-api')
const youTubeKey = config.keys.youTubeKey

youtube.authenticate({
    type: "key",
    key: youTubeKey
})

//ANCHOR Search Options
const searchOptions = {
    part: ['snippet', 'contentDetails'],
    chart: 'mostPopular',
    maxResults: 1,
    key: youTubeKey,
}

module.exports = {
    name: 'youtube',
    description: 'finds youtube videos using the youtube api',
    usage: ' ',
    helper: true,

    async Search(query) {
        return new Promise(function (resolve, reject) {
            var req = youtube.search.list({
                type: "video",
                part: "snippet",
                maxResults: 1,
                q: query
            }, (err, data) => {
                if (err)
                    reject(Error(err))
                else
                    resolve(req.response.body.items[0])
            })
        })
    },

    async GetVideoByID(id) {
        return new Promise(function (resolve, reject) {
            var req = youtube.videos.list({
                part: ['contentDetails'],
                id: id
            }, (err, data) => {
                if (err)
                    reject(Error(err))
                else
                    resolve(req.response.body.items[0])
            })
        })
    },

    async GetVideo(query) {
        const result = youtube.search.list({
            type: "video",
            part: "snippet",
            maxResults: 1,
            q: query
        }, (err, data) => {
            if (err) return
            return req.response.body.items[0]
        })

        if (result.id !== undefined)
            return await this.GetVideo(result.id.videoId)
    }
}