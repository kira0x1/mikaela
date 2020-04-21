import { Message } from 'discord.js';
import { getPlayer } from '../../app';
import { ICommand } from '../../classes/Command';
import { ISong } from '../../classes/Player';
import { getUser } from '../../db/userController';
import { getTarget } from '../../util/FavoritesUtil';
import { QuickEmbed } from '../../util/Style';
import { playSong } from '../music/play';

export const command: ICommand = {
    name: 'play',
    description: 'Play a song from yours or someone elses favorites',
    aliases: ['p'],
    args: true,
    usage: '[song index | startIndex - endIndex (To Select Multiple Songs) ]',

    async execute(message, args) {
        const player = getPlayer(message);
        if (!player) return;

        if (!player.inVoice && !message.member.voice.channel)
            return QuickEmbed(message, `You must be in a voice channel to play music`);

        findFavorite(message, args)
            .then(res => {
                if (res instanceof Array) res.map(song => playSong(message, song));
                else playSong(message, res);
            })
            .catch(err => QuickEmbed(message, err));
    },
};

export async function findFavorite(message: Message, args: string[]): Promise<ISong | ISong[]> {
    return new Promise(async (resolve, reject) => {
        let songArg = '';
        let songIndex: number | undefined = undefined;

        const songIndexes: number[] = [];
        const indexesToDelete: number[] = [];

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];

            if (typeof Number(arg) !== 'number') continue;

            songArg = arg;
            songIndex = Number(arg);
            if (songIndex) songIndexes.push(songIndex);

            // console.log(`ArgIndex: ${i}`);
            indexesToDelete.push(i);

            //todo Try using splice, and replacing array
            // args.splice(i, 1);
        }

        indexesToDelete.map(i => {
            // console.log(chalk.bgMagenta.bold(`DELETING ARG AT INDEX: ${i}, ARG: ${args[i]}`));
            args.splice(i, 1);
        });

        //? Get User
        const targetQuery = args.join(' ');
        const target = await getTarget(message, targetQuery);

        if (!target) return reject(`Target "${targetQuery}" not found`);
        if (songIndex === undefined) return reject(`no song index given`);

        const userResult = await getUser(target.id);
        const fav = userResult.favorites;

        if (songIndexes.length === 2) {
            const startRange = songIndexes[0] - 1;
            const endRange = songIndexes[1]--;

            // console.log(`Start: ${startRange}, End: ${endRange}`);
            const startValid = startRange < fav.length && startRange >= 0;
            const endValid = endRange <= fav.length && endRange > 0;

            if (!startValid || !endValid) return reject(`This user doesnt have songs in that range`);
            const songs = fav.slice(startRange, endRange);
            return resolve(songs);
        }

        songIndex--;
        if (fav.length < songIndex || !fav[songIndex]) return reject(`song at index \"${songArg}\" not found`);

        return resolve(fav[songIndex]);
    });
}
