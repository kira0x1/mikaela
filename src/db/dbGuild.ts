import chalk from 'chalk';
import { Client, Collection, Guild } from 'discord.js';
import { Schema } from 'mongoose';

import { prefix } from '../config';
import { conn } from './database';
import { allGuilds } from './guildController';

export var guildSettings: Collection<string, IGuild> = new Collection();

export interface IGuild {
    name: string;
    guildId: string;
    icon: string;
    prefix: string;

    //TODO Enabled / Disabled commands
}

export const GuildSchema = new Schema({
    name: { type: String, required: true },
    guildId: { type: String, required: true },
    icon: { type: String, required: true },
    prefix: { type: String, required: true },
    createdAt: Date,
});

//Create a UserModel and insert it into the database, returns an error if the user already exists
export function CreateGuild(guild: IGuild | Guild): IGuild {
    var guildModel = conn.model('guilds', GuildSchema);
    console.log(`creating guild: ${guild.name}`);

    if (guild instanceof Guild) {
        const iguild: IGuild = {
            name: guild.name,
            guildId: guild.id,
            icon: guild.icon,
            prefix: prefix,
        };
        guildModel.create(iguild);
        return iguild;
    } else {
        guildModel.create(guild);
        return guild;
    }
}

//Setup guildSettings variable
export async function InitGuilds(client: Client) {
    //Get all the guilds from the database,
    //and then put them in the guildSettings variable
    await allGuilds()
        .then(guilds => {
            guilds.map(guild => {
                guildSettings.set(guild.guildId, guild);
            });
        })
        .catch(err => {
            console.log(chalk.bgRed(`Error in db: ${err}`));
        });

    //Look through all guilds the bot is in, and if
    //the guild isnt in the database then create it
    client.guilds.cache.map(guild => {
        if (!guildSettings.has(guild.id)) {
            const guildCreated = CreateGuild(guild);
            guildSettings.set(guildCreated.guildId, guildCreated);
        }
    });

    guildSettings.map(g => console.log(g.name));
}
