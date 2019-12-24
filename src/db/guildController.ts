import { conn } from './database';
import { GuildSchema, IGuild } from './dbGuild';

export async function allGuilds(): Promise<IGuild[]> {
    return new Promise(function (resolve, reject) {
        var guildModel = conn.model('guilds', GuildSchema)

        guildModel.find((err: any, guilds: IGuild[]) => {
            if (err) return reject(err)
            else return resolve(guilds)
        })
    })
}


export async function updateGuild(id: string, guild: IGuild) {
    return new Promise(async function (resolve, reject) {
        var guildModel = conn.model('guilds', GuildSchema)
        guildModel.findOneAndUpdate({ guildId: id }, guild, (err: any, res: any) => {
            if (err) {
                reject(err)
            } else {
                resolve(guild)
            }
        })
    })
}