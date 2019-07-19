const config = require('../../config.json')
const ytNode = require('youtube-node')
const youTubeKey = config.keys.youTubeKey
const youtube = new ytNode()

youtube.setKey(youTubeKey)

//ANCHOR Search Options
const searchOptions = {
    part: ['snippet'],
    chart: 'mostPopular',
    maxResults: 1,
    key: youTubeKey,
    type: 'video'
}

module.exports = {
    name: 'youtube',
    description: 'finds youtube videos using the youtube api',
    usage: ' ',
    helper: true,

    async Search(query) {
        return new Promise((resolve, reject) => {
            youtube.search(query, 1, searchOptions, function (error, result) {
                if (error) {
                    reject(error)
                    return
                }
                resolve(result.items[0])
            });
        })
    },
}