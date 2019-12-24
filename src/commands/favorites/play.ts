import { ICommand } from '../../classes/Command';
import { getTarget } from '../../util/FavoritesUtil';
import { getPlayer } from '../../app';
import { QuickEmbed } from '../../util/style';
import { getUser } from '../../db/userController';
import { Message } from 'discord.js';
import { ISong } from '../../classes/Player';
import { PlaySong } from '../music/play';

export const command: ICommand = {
    name: "play",
    description: "Play a song from yours or someone elses favorites",
    aliases: ["p"],
    args: true,
    usage: "",

    async execute(message, args) {
        const song = await findFavorite(message, args)

        if (song) {
            PlaySong(message, song)
        }
    }
}

export async function findFavorite(message: Message, args: string[]): Promise<ISong | undefined> {
    const target = await getTarget(message, args.join(" "))
    if (!target) return undefined

    let songIndex: number | undefined = undefined;
    if (args.length === 1) {
        songIndex = Number(args.shift());
    }
    else {
        args.find((arg, pos) => {
            if (Number(arg)) {
                songIndex = Number(arg);
                args.splice(pos, 1);
                return;
            }
        });
    }

    if (songIndex === undefined) {
        QuickEmbed(message, `no song index given`);
        return undefined
    }

    const userResult = await getUser(target.id)

    const fav = userResult.favorites;
    songIndex--;
    if (fav.length < songIndex) {
        QuickEmbed(message, `song not found`);
        return undefined
    }

    return fav[songIndex]
}