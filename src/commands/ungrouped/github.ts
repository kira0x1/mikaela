import { Command } from '../../classes/Command';

const githubLink = 'https://github.com/kira0x1/mikaela'

export const command: Command = {
    name: 'Github',
    description: 'Links mikaelas github',
    aliases: ['git', 'code'],

    async execute(message, args) {
        message.channel.send(`> **Mikaela's Github**\n${githubLink}`);
    },
};
