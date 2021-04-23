import { Guild } from 'discord.js';

import { logger } from '../../app';
import { Queue } from '../../classes/Queue';
import { findPlayer, players } from '../../util/musicUtil';
import { Server } from '../models/Server';

export async function getAllServers(guilds: Guild[]) {
    const servers = guilds.map(g => findOrCreateServer(g))
    return await Promise.all(servers)
}

export async function findServer(id: string) {
    try {
        const server = await Server.findOne({ serverId: id });
        return server;
    } catch (error) {
        logger.error(error);
    }
}

async function createServer(guild: Guild) {
    try {
        return await new Server(convertGuildToIServer(guild)).save();
    } catch (error) {
        logger.error(error);
    }
}

function convertGuildToIServer(guild: Guild) {
    return {
        serverId: guild.id,
        serverName: guild.name,
        queue: []
    };
}

export async function findOrCreateServer(guild: Guild) {
    try {
        let server = await findServer(guild.id);
        if (!server) server = await createServer(guild);
        return server;
    } catch (error) {
        logger.error(error);
    }
}

export async function setServerQueue(guild: Guild, queue: Queue) {
    const server = await findOrCreateServer(guild);
    server.queue = queue.songs;
    return await server.save();
}

export async function saveAllServersQueue() {
    const guilds = players.map(p => p.guild)

    const serverPromises = guilds.map(g => findOrCreateServer(g))
    const servers = await Promise.all(serverPromises)

    servers.map(server => {
        const player = findPlayer(server.serverId)
        server.queue = player.queue.songs
    })

    await Promise.all(servers.map(server => server.save()))
}
