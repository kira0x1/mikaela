import chalk from 'chalk';
import { Message, User } from 'discord.js';

import { findPlayer, setNewPlayer } from '../app';
import { IDuration } from '../classes/Player';
import { addUser, getUser } from '../db/userController';

export function ConvertDuration(duration_seconds: number | string) {
    let minutes: number = Math.floor(Number(duration_seconds) / 60);
    let seconds: number | string = Math.floor(Number(duration_seconds) - minutes * 60);
    let hours = Math.floor(minutes / 60);

    if (seconds < 10) seconds = '0' + seconds;

    const duration: IDuration = {
        seconds: seconds.toString(),
        minutes: minutes.toString(),
        hours: hours.toString(),
        duration: `${minutes}:${seconds}`,
    };

    return duration;
}

export function msToTime(duration_ms: number | string) {
    //Check if its a string, and convert it to a number if it is
    if (typeof duration_ms === 'string') duration_ms = Number(duration_ms);

    const seconds: string | number = Math.floor((duration_ms / 1000) % 60),
        minutes: string | number = Math.floor((duration_ms / (1000 * 60)) % 60),
        hours: string | number = Math.floor((duration_ms / (1000 * 60 * 60)) % 24);

    // const hoursFormatted = hours < 10 ? '0' + hours : hours;
    // const minutesFormatted = minutes < 10 ? '0' + minutes : minutes;
    const secondsFormatted = seconds < 10 ? '0' + seconds : seconds;

    let timeArgs = [];

    if (hours > 0) timeArgs.push(hours + 'h');
    if (minutes > 0) timeArgs.push(minutes + 'm');
    if (seconds > 0) timeArgs.push(secondsFormatted + 's');

    return timeArgs.join(':');
    // return `${hoursFormatted}h, ${minutesFormatted}m, ${secondsFormatted}s`;
}
export function getPlayer(message: Message) {
    const guildId = message.guild.id;
    let playerFound = findPlayer(guildId);

    if (playerFound === null || playerFound === undefined) {
        setNewPlayer(guildId);
        console.log(chalk.bgRed.bold(`Player for guild ${message.guild.name} not found. ID: ${guildId}`));
        // players.set(guildId, new Player(message.guild, client));
        playerFound = findPlayer(guildId);
    }

    return playerFound;
}
export async function getTarget(message: Message, username: string) {
    let user: undefined | User = undefined;
    let userName = username.toLowerCase();

    if (!userName) {
        let member = await message.guild.members.fetch(message.author);
        user = member.user;
    } else {
        if (message.mentions.users.size > 0) user = message.mentions.members.first().user;
        else {
            let member = message.guild.members.cache.find(m => m.displayName.toLowerCase() === userName);
            if (member) user = member.user;
        }
    }

    if (!user) {
        let member = await message.guild.members.fetch(message.author);
        user = member.user;
    }

    let userDb = await getUser(user.id)
        .then(() => {})
        .catch(err => {
            if (!user) return console.log(`user undefined`);
            addUser({
                tag: user.tag,
                username: user.username,
                favorites: [],
                id: user.id,
                roles: [],
                sourcesGroups: [],
            })
                .then(user => {})
                .catch(err => console.log(err));
        });

    return user;
}
