import { Song } from "./Song";

export class Queue {
    songs: Song[] = [];

    constructor(songs?: Array<Song>) {
        if (songs) {
            this.songs = songs;
        } else {
            this.songs = [];
        }
    }

    addSong(song: Song) {
        this.songs.push(song);
    }

    getNext(): Song | undefined {
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

    hasSongs() {
        return this.songs.length > 0
    }
}