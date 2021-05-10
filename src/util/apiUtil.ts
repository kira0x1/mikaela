import { Util, Message } from 'discord.js';
import YouTube from 'youtube-sr';
import { getInfo, MoreVideoDetails, validateURL } from 'ytdl-core';
import ytpl from 'ytpl';
import { logger } from '../app';
import { Song } from '../classes/Song';
import { ConvertDuration } from './musicUtil';
import { quickEmbed, wrap } from './styleUtil';
import spotifyURI from 'spotify-uri'
import spotify from 'spotify-url-info'

export function rand(max: number) {
   return Math.floor(Math.random() * max);
}

export async function getSong(query: string, allowPlaylists: boolean = false): Promise<Song | ytpl.Result | Song[]> {
   try {
      // Check if spotify song
      if (isSpotify(query)) {
         return await handleSpotify(query, allowPlaylists)
      }

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
      const songSearch = await YouTube.searchOne(query);
      if (!songSearch) return;


      //If a video is found then get details and convert it to ISong
      const details = await getSongDetails(songSearch.id);
      if (!details) return;

      return convertDetailsToSong(details);
   } catch (error) {
      logger.error(error.stack);
   }
}

function isSpotify(query: string) {
   if (!query.includes("spotify")) return false;
   const parsed = spotifyURI.parse(query);
   if (!parsed.type) return false;
   return true;
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
   try {
      if (!link) return;
      const info = await getInfo(link);

      if (!info) return;
      return info.videoDetails;
   } catch (error) {
      logger.error(error.stack);
   }
}

export function sendSongNotFoundEmbed(message: Message, query: string) {
   quickEmbed(message, `Song not found: ${wrap(query)}`, { addFooter: true });
}


async function handleSpotify(query: string, allowPlaylists: boolean = false) {
   const data = await spotify.getData(query);
   if (data.type === 'track') {
      const songQuery = `${data.name} ${data.artists.map(a => a.name).join(" ")}`
      return await getSpotifySong(songQuery)
   } else if (allowPlaylists) {
      const songs = await convertSpotifyPlatlist(data);
      return songs
   }
}

async function getSpotifySong(track: string) {
   const song = await YouTube.searchOne(track);
   if (!song) return;

   const details = await getSongDetails(song.id)
   if (!details) return;

   return convertDetailsToSong(details)
}

async function convertSpotifyPlatlist(spotifyData: any) {
   const queries = spotifyData.tracks.items.map(item => {
      const track = item.track || item
      return `${track.name} ${track.artists.map(a => a.name).join(" ")}`;
   })

   const promises = queries.map(track => getSpotifySong(track))
   const songs: Song[] = await Promise.all(promises)

   return songs;
}