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
