import { Message } from 'discord.js';
import { ICommand } from '../../classes/Command';
import { ISong } from '../../classes/Player';
import { getUser } from '../../db/userController';
import { getPlayer, getTarget } from '../../util/musicUtil';
import { QuickEmbed } from '../../util/styleUtil';
import { playSong } from '../music/play';

export const command: ICommand = {
    name: 'play',
    description: 'Play a song from yours or someone elses favorites',
    aliases: ['p'],
    args: true,
    usage: '[song index | startIndex - endIndex (To Select Multiple Songs) ]',
    cooldown: 1,

    async execute(message, args) {
        const player = getPlayer(message);
        if (!player) return;

        if (!player.inVoice && !message.member.voice.channel)
            return QuickEmbed(message, `You must be in a voice channel to play music`);

        try {
            const res = await findFavorite(message, args);
            if (res instanceof Array) res.map(song => playSong(message, song));
            else playSong(message, res);
        } catch (err) {
            QuickEmbed(message, err);
        }
    },
};

export async function findFavorite(message: Message, args: string[]): Promise<ISong | ISong[]> {
    let songArg = '';
    let songIndex: number | undefined = undefined;

    const songRanges: number[] = []

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg !== "-") continue;
        songRanges.push(Number(args[i - 1]))
        songRanges.push(Number(args[i + 1]))
        args.splice(i - 1, 3)
        break;
    }

    if (songRanges.length !== 2) {
        for (let i = 0; i < args.length; i++) {
            const arg = args[i]
            if (!Number(arg)) continue;

            songIndex = Number(arg)
            args.splice(i, 1)
            break;
        }
    }


    //? Get User
    let target = message.author
    if (args.length > 0) target = await getTarget(message, args.join(' '));

    if (!target) throw `Could not find user \`${args.join(' ')}\``

    const userResult = await getUser(target.id);
    const fav = userResult.favorites;

    if (songRanges.length === 2) {
        const startRange = songRanges[0] - 1;
        const endRange = songRanges[1]--;

        const startValid = startRange < fav.length && startRange >= 0;
        const endValid = endRange <= fav.length && endRange > 0;

        if (!startValid || !endValid) throw `This user doesnt have songs in that range`;

        const songs = fav.slice(startRange, endRange);
        return songs;
    }

    if (songIndex === undefined) throw `no song index given`;

    songIndex--;
    if (fav.length < songIndex || !fav[songIndex]) throw `song at index \"${songArg}\" not found`;
    return fav[songIndex];
}
