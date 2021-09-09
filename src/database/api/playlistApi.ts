import { logger } from '../../app';
import { Playlist } from '../models/Playlist';

export async function createPlaylist(authorId: string, title: string, description?: string) {
   try {
      const playlist = new Playlist({ author: authorId, title: title, description: description });
      return await playlist.save();
   } catch (error) {
      logger.error(error);
   }
}

export async function getPlaylists(authorId: string) {
   try {
      const playlists = await Playlist.find({ author: authorId });
      return playlists;
   } catch (error) {
      logger.error(error);
   }
}
