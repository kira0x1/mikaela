import { ICommand } from '../../classes/Command';

export const command: ICommand = {
    name: 'Horny',
    description: 'Posts a response to horny people 😳',

    async execute(message, args) {
        const dogeHorny = 'https://cdn.discordapp.com/attachments/285778400956645376/752686497592770651/wench.mp4';
        const dogeBonk = 'https://cdn.discordapp.com/attachments/419976078321385473/736559596155699290/fetchimage.png';

        const content = Math.floor(Math.random() * 2) == 0 ? dogeHorny : dogeBonk;
        message.channel.send(content);
    },
};
