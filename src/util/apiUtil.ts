import rp from 'request-promise';
import { ISong } from '../classes/Player';
import { ConvertDuration } from './musicUtil';
import { Youtube } from '../classes/Youtube';

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
export async function getSong(query: string): Promise<ISong> {
    return new Promise((resolve, reject) => {
        ytdl.getInfo(query)
            .then(info => {
                let songResult: ISong = {
                    title: info.title,
                    id: info.video_id,
                    url: info.video_url,
                    duration: ConvertDuration(info.length_seconds),
                };

                return resolve(songResult);
            })
            .catch(err => {
                Youtube.Get(query)
                    .then(songResult => {
                        if (songResult) return resolve(songResult);
                        else {
                            return reject(undefined);
                        }
                    })
                    .catch(err => {
                        return reject(undefined);
                    });
            });
    });
}

export interface ISongSearch {
    items: Array<{
        id: { videoId: string };
        snippet: { title: string };
    }>;
}
