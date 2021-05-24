export interface Song {
   title: string;
   id: string;
   url: string;
   duration: IDuration;
   playedBy?: string;

   // favsource holds the id of the user whos favorites the song was gotten from
   favSource?: string;

   // if this song is from a spotify link then use this to display it
   spotifyUrl?: string;
}

export interface IDuration {
   seconds: string;
   minutes: string;
   hours: string;
   duration: string;
   totalSeconds: number;
}
