import { ICommand } from '../../classes/Command';
import { getPlayer } from '../../app';
export const command: ICommand = {
    name: 'join',
    description: "Joins voice",

    execute(message, args) {
        //Get the guilds player
        const player = getPlayer(message)

        if (player) {
            //Join the VoiceChannel
            player.join(message)
        }
    }
}