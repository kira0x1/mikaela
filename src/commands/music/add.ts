import { ICommand } from "../../classes/Command";
import { getPlayer } from '../../app';
import { GetSong } from '../../util/Api';
import { QuickEmbed } from '../../util/Style';

export const command: ICommand = {
    name: "Add",
    description: "Add song to queue",

    async execute(message, args) {
        //Get the guilds player
        const player = getPlayer(message)

        if (player) {
            const query = args.join(" ")

            //Get song
            GetSong(query).then(song => {

                //If the song is found add it to the queue
                player.queue.addSong(song)
            }).catch(err => {
                QuickEmbed(message, "Song not found")
            })
        }
    }
}