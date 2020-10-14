import { ICommand } from '../../classes/Command';

const dogeHorny = 'https://cdn.discordapp.com/attachments/285778400956645376/752686497592770651/wench.mp4';
const dogeBonk = 'https://cdn.discordapp.com/attachments/419976078321385473/736559596155699290/fetchimage.png';

export const command: ICommand = {
    name: 'Horny',
    description: 'Posts a response chosen at random to horny people 😳',

    execute(message, args) {
        const content = Math.floor(Math.random() * 2) == 0 ? dogeHorny : dogeBonk;
        message.channel.send(content);
    },
};
