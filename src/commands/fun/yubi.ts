import { Command } from '../../classes/Command';

const yubiLink =
    'https://cdn.discordapp.com/attachments/644126670080573460/764113835291705384/korone_yaaay.webm';

export const command: Command = {
    name: 'yubi',
    description: 'YUBI YUBI!!! 🐱‍💻',
    aliases: ['yubiyubi', 'finger', 'yaay', 'yay'],

    execute(message, args: string[]) {
        message.channel.send(yubiLink);
    },
};
