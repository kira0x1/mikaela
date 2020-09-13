import rp from 'request-promise';
import { ISong } from './Player';
import { ConvertDuration } from '../util/musicUtil';
const ytdl = require('ytdl-core-discord');
import { ISongSearch } from '../util/apiUtil';
import { youTubeKey } from '../config';

export const youtubeOptions = {
    part: 'snippet',
    maxResults: 1,
    order: 'relevance',
    key: youTubeKey,
};

export class Youtube {
    public static async Get(query: string) {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${youtubeOptions.key}&part=${youtubeOptions.part}&maxResults=${youtubeOptions.maxResults}&order=${youtubeOptions.order}&q=${query}`;

        let song: ISong | undefined = undefined;
        let id: string | undefined = undefined;

        await rp(url)
            .then(data => {
                let body: ISongSearch = JSON.parse(data);
                id = body.items[0].id.videoId;
            })
            .catch(err => console.log('couldnt find id'));

        if (id) {
            let res = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);
            song = {
                title: res.title,
                url: res.video_url,
                id: id,
                duration: ConvertDuration(res.length_seconds),
            };
        }

        return song;
    }
}
