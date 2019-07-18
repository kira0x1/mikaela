const config = require('../../../config.json')
const ytNode = require('youtube-node')
const youTubeKey = config.keys.youTubeKey
const youtube = new ytNode()
youtube.setKey(youTubeKey)

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
        youtube.search(query, 2, function (error, result) {
            if (error) return
            return result
        });
    },
}