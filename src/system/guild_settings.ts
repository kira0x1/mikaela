import { Collection, Client } from 'discord.js';
import { Settings } from '../classes/Settings';
import { defaultSettings } from '../config';

export const guildSettings: Collection<string, Settings> = new Collection();

export function initSettings(client: Client) {
    client.guilds.cache.map(guild => {
        guildSettings.set(guild.id, defaultSettings);
    });
}
