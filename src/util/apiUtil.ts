import YouTube from 'youtube-sr';
import { MoreVideoDetails } from 'ytdl-core';
import { getInfo, validateURL } from 'ytdl-core-discord';
import ytpl from 'ytpl';
import { ISong } from '../classes/Player';
import { ConvertDuration } from './musicUtil';

export function rand(max: number) {
    return Math.floor(Math.random() * max);
}

//todo Change error return to make it compatable with QuickEmbed
export async function getSong(query: string): Promise<ISong | ytpl.result> {
    try {

        if (validateURL(query)) {
            const details = await getSongDetails(query)
            if (!details) return

            return convertDetailsToSong(details)
        }

        if (ytpl.validateID(query)) {
            const playlist = await ytpl(query)
            if (!playlist) return
            return playlist
        }


        const songSearch = await YouTube.search(query, { limit: 1 })
        if (!songSearch) return


        const details = await getSongDetails(songSearch[0].url)
        if (!details) return

        return convertDetailsToSong(details)
    } catch (err) {
    }
}

// async function searchYoutube(query: string) {
//     const res = await YouTube.search(query, { limit: 1 })
//     if (!res) throw 'Song not found'
//     const details = await getSongDetails(res[0].url);
// }

export function isPlaylist(song: ISong | ytpl.result): song is ytpl.result {
    return (song as ytpl.result).items !== undefined
}

function convertDetailsToSong(details: MoreVideoDetails): ISong {
    return {
        title: details.title,
        id: details.videoId,
        url: details.video_url,
        duration: ConvertDuration(details.lengthSeconds)
    }
}

export async function convertPlaylistToSongs(playlist: ytpl.result): Promise<ISong[]> {
    const res: ISong[] = []

    for (let i = 0; i < playlist.items.length && i < 20; i++) {
        const item = playlist.items[i]
        const info = await getInfo(item.url_simple)
        res.push(convertDetailsToSong(info.videoDetails))
    }

    return res
}

async function getSongDetails(link) {
    const info = await getInfo(link)
    if (!info) return
    return info.videoDetails
}
