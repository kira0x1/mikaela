import { getInfo, validateURL } from 'ytdl-core-discord';
import ytsr from 'ytsr';
import { ISong } from '../classes/Player';
import { ConvertDuration } from './musicUtil';


export function rand(max: number) {
    return Math.floor(Math.random() * max);
}

//todo Change error return to make it compatable with QuickEmbed
export async function getSong(query: string): Promise<ISong> {
    try {
        if (validateURL(query)) {
            const details = await getSongDetails(query)
            if (!details) return

            return {
                title: details.title,
                id: details.videoId,
                url: details.video_url,
                duration: ConvertDuration(details.lengthSeconds)
            }
        }

        const songSearch = await ytsr(query, { limit: 1 })
        if (!songSearch) return

        const res = songSearch.items[0]
        if (!res || res.type !== 'video') return

        const details = await getSongDetails(res.link)
        if (!details) return

        return {
            title: details.title,
            id: details.videoId,
            url: details.video_url,
            duration: ConvertDuration(details.lengthSeconds)
        }
    } catch (err) {
        console.log(`Song not found: ${err}`)
    }
}

async function getSongDetails(link) {
    const info = await getInfo(link)
    if (!info) return
    return info.videoDetails
}
