import { ISong } from "./Player";

export class Queue {
    songs: Array<ISong> = [];

    constructor(songs?: Array<ISong>) {
        if (songs) {
            this.songs = songs;
        } else {
            this.songs = [];
        }
    }

    addSong(song: ISong) {
        this.songs.push(song);
    }

    getNext(): ISong | undefined {
        return this.songs.shift();
    }

    clear() {
        this.songs = [];
    }

    removeAt(index: number) {
        return this.songs.splice(index, 1);
    }

    shuffle() {
        let currentIndex = this.songs.length

        //While there are still elements to shuffle
        while (0 !== currentIndex) {
            //Pick a remaining element
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            //Swap it with the current element;
            const tempValue = this.songs[currentIndex];
            this.songs[currentIndex] = this.songs[randomIndex];
            this.songs[randomIndex] = tempValue;
        }
    }
}