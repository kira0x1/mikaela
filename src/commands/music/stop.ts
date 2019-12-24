import { ICommand } from '../../classes/Command';
import { getPlayer } from '../../app';
export const command: ICommand = {
    name: "stop",
    description: "stops the music player",
    aliases: ["end", "s"],

    execute(message, args) {
        const player = getPlayer(message);
        if (player) {
            player.leave()
        }
    }
}