import rp from 'request-promise';
import ytsr from 'ytsr';

import { ISong } from '../classes/Player';
import { ConvertDuration } from './musicUtil';

const ytdl = require('ytdl-core-discord');

export function Get(url: string, options?: any) {
    if (!options)
        options = {
            method: 'GET',
            json: true,
        };

    return new Promise((resolve, reject) => {
        rp(url, options)
            .then(body => resolve(body))
            .catch(err => reject(err));
    });
}

export function rand(max: number) {
    return Math.floor(Math.random() * max);
}

//todo Change error return to make it compatable with QuickEmbed
export function getSong(query: string): Promise<ISong> {
    return new Promise((resolve, reject) => {
        ytsr(query, { limit: 1 }).then(async searchResult => {
            const res = searchResult.items[0]
            if (res.type === 'video') {
                const info = await ytdl.getInfo(res.link)
                const details = info.videoDetails

                let songRes: ISong = {
                    title: details.title,
                    id: details.videoId,
                    url: details.video_url,
                    duration: ConvertDuration(details.lengthSeconds)
                };

                return resolve(songRes)
            }
        }).catch(() => {
            ytdl.getInfo(query)
                .then(info => {
                    const details = info.videoDetails
                    let songResult: ISong = {
                        title: details.title,
                        id: details.videoId,
                        url: details.video_url,
                        duration: ConvertDuration(details.lengthSeconds),
                    };

                    if (songResult)
                        return resolve(songResult);
                })
        })
    })
}

export interface ISongSearch {
    items: Array<{
        id: { videoId: string };
        snippet: { title: string };
    }>;
}
