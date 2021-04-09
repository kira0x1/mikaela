import { Document, model, Schema } from "mongoose";
import { Song } from "../../classes/Song";

export interface IServer extends Document {
    serverId: string,
    serverName: string,
    lastPlayed: Song[]
}

export const ServerSchema = new Schema({
    serverId: { type: String, required: true },
    serverName: { type: String, required: true },
    lastPlayed: { type: Array<Song>(), required: true }
})

export const Server = model<IServer>('servers', ServerSchema)