import YouTube from 'youtube-sr';
import { MoreVideoDetails } from 'ytdl-core';
import { getInfo, validateURL } from 'ytdl-core-discord';
import ytpl from 'ytpl';
import { ISong } from '../classes/Player';
import { ConvertDuration } from './musicUtil';

export function rand(max: number) {
    return Math.floor(Math.random() * max);
}

export async function getSong(query: string): Promise<ISong | ytpl.result> {
    try {
        // Check if the query is a link to a youtube video
        if (validateURL(query)) {
            const details = await getSongDetails(query)
            if (!details) return

            return convertDetailsToSong(details)
        }

        // Check if the query is a link to a youtube playlist
        if (ytpl.validateID(query)) {
            const playlist = await ytpl(query)
            if (!playlist) return
            return playlist
        }


        // Search for a youtube for the video
        const songSearch = await YouTube.search(query, { limit: 1 })
        if (!songSearch) return

        //If a video is found then get details and convert it to ISong
        const details = await getSongDetails(songSearch[0].url)
        if (!details) return

        return convertDetailsToSong(details)
    } catch (err) {
        console.error(err)
    }
}

// Returns true if its a playlist
export function isPlaylist(song: ISong | ytpl.result): song is ytpl.result {
    return (song as ytpl.result).items !== undefined
}

// Convertts the video details to ISong
function convertDetailsToSong(details: MoreVideoDetails): ISong {
    return {
        title: details.title,
        id: details.videoId,
        url: details.video_url,
        duration: ConvertDuration(details.lengthSeconds)
    }
}

// Converts a playlist retrieved from ytpl to an array of ISong
export async function convertPlaylistToSongs(playlist: ytpl.result): Promise<ISong[]> {
    const res: ISong[] = []

    for (let i = 0; i < playlist.items.length && i < 20; i++) {
        const item = playlist.items[i]
        const info = await getInfo(item.url_simple)
        res.push(convertDetailsToSong(info.videoDetails))
    }

    return res
}

// A helper function that gets info from a link
async function getSongDetails(link: string) {
    const info = await getInfo(link)
    if (!info) return
    return info.videoDetails
}
