import { Document, model, Schema } from 'mongoose';
import { Song } from '../../classes/Song';

export interface IPlaylist extends Document {
   title: string;
   description?: string;
   author: string;
   songs: Song[];
   createdAt: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlaylistSchema = new Schema({
   title: { type: String, required: true },
   description: { type: String, required: false },
   author: { type: Schema.Types.ObjectId, ref: 'users', required: true },
   songs: { type: Array<Song>(), required: true },
   createdAt: { type: Date, default: Date.now() }
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Playlist = model<IPlaylist>('playlists', PlaylistSchema);
