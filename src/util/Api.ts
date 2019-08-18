import rp from 'request-promise'
import { IReddit, IRedditRequest } from '../objects/reddit'
import { youTubeKey } from '../config'
import { ISong, ConvertDuration } from '../db/dbSong';
import { getInfo } from 'ytdl-core';

export function Get(url: string, options?: any) {
    if (!options)
        options = {
            method: 'GET',
            json: true
        }

    return new Promise((resolve, reject) => {
        rp(url, options)
            .then(body => resolve(body))
            .catch(err => reject(err))
    })
}

export function rand(max: number) {
    return Math.floor(Math.random() * max)
}

export class Reddit {
    public static async Get(
        subreddit?: string,
        sort?: string | 'hot',
        time?: string | 'all',
        limit?: string | number | '10'
    ) {
        const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?&t=${time}&limit=${limit}`
        let posts: Array<IReddit> = []

        await Get(url).then(data => {
            let body: IRedditRequest = JSON.parse(JSON.stringify(data))
            body.data.children.map(post => posts.push(post.data))
        })

        let nsfw = posts[0].over_18
        return { posts, nsfw }
    }
}

const options = {
    part: 'snippet',
    maxResults: 1,
    order: 'relevance',
    key: youTubeKey,
}

export class Youtube {
    public static async Get(query: string) {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${options.key}&part=${options.part}&maxResults=${options.maxResults}&order=${options.order}&q=${query}`

        let song: ISong | undefined = undefined
        let id: string | undefined = undefined

        await rp(url).then(data => {
            let body: ISongSearch = JSON.parse(data)
            id = body.items[0].id.videoId
        }).catch(() => { })

        if (id) {
            let res = await getInfo(`https://www.youtube.com/watch?v=${id}`)
            song = { title: res.title, url: res.video_url, id: id, duration: ConvertDuration(res.length_seconds) }
        }

        return song
    }
}

export interface ISongSearch {
    items: Array<{
        id: { videoId: string },
        snippet: { title: string }
    }>
}
