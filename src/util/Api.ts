import rp from "request-promise";
import { youTubeKey } from "../config";
import { ConvertDuration } from "./musicUtil";
import { getInfo } from "ytdl-core";
import { ISong } from "../classes/Player";
import ytdl from "ytdl-core";

export function Get(url: string, options?: any) {
   if (!options)
      options = {
         method: "GET",
         json: true,
      };

   return new Promise((resolve, reject) => {
      rp(url, options)
         .then((body) => resolve(body))
         .catch((err) => reject(err));
   });
}

export function rand(max: number) {
   return Math.floor(Math.random() * max);
}

export async function GetSong(query: string): Promise<ISong> {
   return new Promise((resolve, reject) => {
      ytdl
         .getInfo(query)
         .then((info) => {
            let songResult: ISong = {
               title: info.title,
               id: info.video_id,
               url: info.video_url,
               duration: ConvertDuration(info.length_seconds),
            };

            return resolve(songResult);
         })
         .catch((err) => {
            Youtube.Get(query)
               .then((songResult) => {
                  if (songResult) return resolve(songResult);
                  else {
                     return reject(undefined);
                  }
               })
               .catch((err) => {
                  return reject(undefined);
               });
         });
   });
}

const options = {
   part: "snippet",
   maxResults: 1,
   order: "relevance",
   key: youTubeKey,
};

export class Youtube {
   public static async Get(query: string) {
      const url = `https://www.googleapis.com/youtube/v3/search?key=${options.key}&part=${options.part}&maxResults=${options.maxResults}&order=${options.order}&q=${query}`;

      let song: ISong | undefined = undefined;
      let id: string | undefined = undefined;

      await rp(url)
         .then((data) => {
            let body: ISongSearch = JSON.parse(data);
            id = body.items[0].id.videoId;
         })
         .catch((err) => console.log("couldnt find id"));

      if (id) {
         let res = await getInfo(`https://www.youtube.com/watch?v=${id}`);
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

export interface ISongSearch {
   items: Array<{
      id: { videoId: string };
      snippet: { title: string };
   }>;
}
