import { ICommand } from '../../classes/Command';

const dogeHorny = 'https://cdn.discordapp.com/attachments/285778400956645376/752686497592770651/wench.mp4';
const dogeBonk = 'https://cdn.discordapp.com/attachments/419976078321385473/736559596155699290/fetchimage.png';
const underArrest = 'https://cdn.discordapp.com/attachments/642037173729624104/775640344217649182/hornyposting.mp4'

const links = [dogeBonk, dogeHorny, underArrest]

export const command: ICommand = {
    name: 'Horny',
    description: 'Posts a response chosen at random to horny people 😳',

    execute(message, args) {
        const choice = Math.floor(Math.random() * links.length)
        message.channel.send(choice);
    },
};
