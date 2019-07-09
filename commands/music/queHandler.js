const queue = new Map()
const { getBasicInfo } = require('ytdl-core')
const log = console.log
const chalk = require('chalk')
const ct = require('common-tags')

module.exports = {
    async  hasQueue() {
        return await !(queue.length === 0 || queue === undefined)
    },
    async AddToQueue(url) {
        const songInfo = await getBasicInfo(url)
        const song = {
            title: songInfo.title,
            url: songInfo.video_url,
            duration: songInfo.duration
        }

        const str = ct.stripIndents`
            Title: ${song.title},
            Url: ${song.url},
            Duration: ${song.duration}
        `
    }
}