import { Document, model, Schema } from "mongoose";
import { ISong } from '../../classes/Player';

export interface IServer extends Document {
    serverId: string,
    serverName: string,
    lastPlayer: ISong[]
}

export const ServerSchema = new Schema({
    serverId: { type: String, required: true },
    serverName: { type: String, required: true },
    lastPlayed: { type: Array<ISong>(), required: true }
})

export const Server = model<IServer>('servers', ServerSchema)