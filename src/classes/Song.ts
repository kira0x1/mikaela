export interface Song {
    title: string;
    id: string;
    url: string;
    duration: IDuration;
    playedBy: string | undefined;
}

export interface IDuration {
    seconds: string;
    minutes: string;
    hours: string;
    duration: string;
    totalSeconds: number;
 }