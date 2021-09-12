import { Message, Util } from 'discord.js';
import spotifyURI from 'spotify-uri';
import spotify from 'spotify-url-info';
import YouTube, { Playlist as YtPlaylist } from 'youtube-sr';
import { getInfo, MoreVideoDetails, validateURL } from 'ytdl-core';
import { logger } from '../app';
import { Song } from '../classes/Song';
import { ConvertDuration } from './musicUtil';
import { quickEmbed, wrap } from './styleUtil';

export function rand(max: number) {
   return Math.floor(Math.random() * max);
}

export async function getSong(query: string, allowPlaylists = false): Promise<Song | Song[]> {
   try {
      // Check if spotify song
      if (isSpotify(query)) {
         return await handleSpotify(query, allowPlaylists);
      }

      // Check if the query is a link to a youtube video
      if (validateURL(query)) {
         const details = await getSongDetails(query);
         if (!details) return;
         return convertDetailsToSong(details);
      }

      // Check if the query is a link to a youtube playlist
      if (YouTube.isPlaylist(query)) {
         const playlist = await YouTube.getPlaylist(query);
         if (!playlist) return;
         return convertPlaylistToSongs(playlist);
      }

      // Search for a youtube for the video
      const songSearch = await YouTube.searchOne(query, 'video');
      if (!songSearch) return;

      // If a video is found then get details and convert it to ISong
      const details = await getSongDetails(songSearch.id);
      if (!details) return;

      return convertDetailsToSong(details);
   } catch (error: any) {
      logger.error(error.stack);
   }
}

function isSpotify(query: string) {
   if (!query.includes('spotify')) return false;
   const parsed = spotifyURI.parse(query);
   if (!parsed.type) return false;
   return true;
}

// Returns true if its a playlist
export function isPlaylist(song: Song | YtPlaylist): song is YtPlaylist {
   return (song as YtPlaylist) !== undefined;
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
export async function convertPlaylistToSongs(playlist: YtPlaylist): Promise<Song[]> {
   const res: Song[] = [];

   for (const video of playlist.videos) {
      if (!video) continue;
      res.push({
         ...video,
         id: video.id || '',
         title: video.title || '',
         url: video.url,
         duration: ConvertDuration(video.duration)
      });
      // const info = await getInfo(item.shortUrl);
      // res.push(convertDetailsToSong(info.videoDetails));
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
   } catch (error: any) {
      logger.error(error.stack);
   }
}

export function sendSongNotFoundEmbed(message: Message, query: string) {
   quickEmbed(message, `Song not found: ${wrap(query)}`, { addFooter: true });
}

async function handleSpotify(query: string, allowPlaylists = false) {
   const data = await spotify.getData(query);
   if (data.type === 'track') {
      return await getSpotifySong(data);
   } else if (allowPlaylists) {
      const songs = await convertSpotifyPlatlist(data);
      return songs;
   }
}

async function getSpotifySong(data: any) {
   const track = `${data.name} ${data.artists.map(a => a.name).join(' ')}`;
   const searchRes = await YouTube.searchOne(track, 'video');
   if (!searchRes) return;

   const details = await getSongDetails(searchRes.id);
   if (!details) return;

   const song = convertDetailsToSong(details);
   song.spotifyUrl = data.external_urls.spotify;
   return song;
}

async function convertSpotifyPlatlist(spotifyData: any) {
   const queries = spotifyData.tracks.items.map(item => {
      return item.track || item;
   });

   const promises = queries.map(track => getSpotifySong(track));
   const songs: Song[] = await Promise.all(promises);

   return songs;
}
