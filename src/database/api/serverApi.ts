import { Guild } from 'discord.js';
import { logger } from '../../app';
import { Server } from '../models/Server';
import { Song } from "../../classes/Song";

export async function findServer(id: string) {
    try {
        const server = await Server.findOne({ serverId: id })
        return server;
    } catch (error) {
        logger.error(error)
    }
}

async function createServer(guild: Guild) {
    try {
        return await new Server(convertGuildToIServer(guild)).save()
    } catch (error) {
        logger.error(error)
    }
}

function convertGuildToIServer(guild: Guild) {
    return {
        serverId: guild.id,
        serverName: guild.name,
        lastPlayed: []
    }
}

export async function findOrCreateServer(guild: Guild) {
    try {
        let server = await findServer(guild.id)
        if (!server) server = await createServer(guild)
        return server
    } catch (error) {
        logger.error(error)
    }
}

