import { IDuration } from '../classes/Player';

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
