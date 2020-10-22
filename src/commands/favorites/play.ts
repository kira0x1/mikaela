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

    const songIndexes: number[] = [];
    const indexesToDelete: number[] = [];

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (isNaN(Number(arg))) {
            continue;
        }
        songArg = arg;
        songIndex = Number(arg);

        if (songIndex) songIndexes.push(songIndex);
        indexesToDelete.push(i);
    }

    indexesToDelete.map(i => {
        args.splice(i, 1);
    });

    //? Get User
    const targetQuery = args.join(' ');
    const target = (await getTarget(message, targetQuery)) || message.author;

    if (!target) throw `Target "${targetQuery}" not found`;
    if (songIndex === undefined) throw `no song index given`;

    const userResult = await getUser(target.id);
    const fav = userResult.favorites;

    if (songIndexes.length === 2) {
        const startRange = songIndexes[0] - 1;
        const endRange = songIndexes[1]--;

        const startValid = startRange < fav.length && startRange >= 0;
        const endValid = endRange <= fav.length && endRange > 0;

        if (!startValid || !endValid) throw `This user doesnt have songs in that range`;

        const songs = fav.slice(startRange, endRange);
        return songs;
    }

    songIndex--;
    if (fav.length < songIndex || !fav[songIndex]) throw `song at index \"${songArg}\" not found`;

    return fav[songIndex];
}
