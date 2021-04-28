import { Document, model, Schema } from 'mongoose';
import { Song } from '../../classes/Song';

// To support multiplebots in the same server we must give the bots id and the prefix
export interface PrefixSetting {
    prefix: string,
    botId: string
}

export interface IServer extends Document {
    serverId: string,
    serverName: string,
    queue: Song[],
    prefixes: PrefixSetting[]
}

export const ServerSchema = new Schema({
    serverId: { type: String, required: true },
    serverName: { type: String, required: true },
    queue: { type: Array<Song>(), required: true },
    prefixes: { type: Array<PrefixSetting>(), required: true }
})

export const Server = model<IServer>('servers', ServerSchema)