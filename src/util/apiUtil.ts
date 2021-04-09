import { Util, Message } from 'discord.js';
import YouTube from 'youtube-sr';
import { getInfo, MoreVideoDetails, validateURL } from 'ytdl-core';
import ytpl from 'ytpl';
import { logger } from '../app';
import { Song } from "../classes/Song";
import { ConvertDuration } from './musicUtil';
import { QuickEmbed, wrap } from './styleUtil';

export function rand(max: number) {
   return Math.floor(Math.random() * max);
}

export async function getSong(query: string): Promise<Song | ytpl.Result> {
   try {
      // Check if the query is a link to a youtube video
      if (validateURL(query)) {
         const details = await getSongDetails(query);
         if (!details) return;

         return convertDetailsToSong(details);
      }

      // Check if the query is a link to a youtube playlist
      // if (ytpl.validateID(query)) {
      //     const playlist = await ytpl(query)
      //     if (!playlist) return
      //     return playlist
      // }

      // Search for a youtube for the video
      const songSearch = await YouTube.search(query, { type: 'video', limit: 1 });
      if (!songSearch) return;

      //If a video is found then get details and convert it to ISong
      if (!songSearch || songSearch.length === 0) return
      const details = await getSongDetails(songSearch[0].id);
      if (!details) return;
      return convertDetailsToSong(details);
   } catch (err) {
      logger.log('error', err);
   }
}

// Returns true if its a playlist
export function isPlaylist(song: Song | ytpl.Result): song is ytpl.Result {
   return (song as ytpl.Result).items !== undefined;
}

// Convertts the video details to ISong
function convertDetailsToSong(details: MoreVideoDetails): Song {
   return {
      title: Util.escapeMarkdown(details.title),
      id: details.videoId,
      url: details.video_url,
      duration: ConvertDuration(details.lengthSeconds),
      playedBy: undefined
   };
}

// Converts a playlist retrieved from ytpl to an array of ISong
export async function convertPlaylistToSongs(playlist: ytpl.Result): Promise<Song[]> {
   const res: Song[] = [];

   for (let i = 0; i < playlist.items.length && i < 20; i++) {
      const item = playlist.items[i];
      const info = await getInfo(item.shortUrl);
      res.push(convertDetailsToSong(info.videoDetails));
   }

   return res;
}

// A helper function that gets info from a link
async function getSongDetails(link: string) {
   if (!link) return
   const info = await getInfo(link);
   if (!info) return;
   return info.videoDetails;
}

export function sendSongNotFoundEmbed(message: Message, query: string) {
   QuickEmbed(message, `Song not found: ${wrap(query)}`, true)
}