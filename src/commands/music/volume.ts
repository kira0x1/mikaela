import { getPlayer } from '../../util/musicUtil';
import { ICommand } from '../../classes/Command';
import { QuickEmbed } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'volume',
    description: 'Change the volume',
    aliases: ['v'],
    usage: '[- | + | number]\n\nDisplays the volume if no arguments given',

    execute(message, args) {
        const arg = args.shift();
        const player = getPlayer(message);
        if (!player) return;

        if (!arg) return QuickEmbed(message, `Volume is currently ${player.volume}`);

        let amount: number | undefined;

        if (arg === '-') {
            amount = player.volume - 0.5;
        } else if (arg === '+') {
            amount = player.volume + 0.5;
        } else if (Number(arg)) {
            amount = Number(arg);
        }

        if (amount) {
            player.changeVolume(amount, message);
        }
    },
};
