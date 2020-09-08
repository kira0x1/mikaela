import chalk from 'chalk';

import { ICommand } from '../../classes/Command';
import { TextChannel, GuildChannel } from 'discord.js';

export const command: ICommand = {
    name: 'delete',
    description: 'Deletes messages',
    usage: '[amount]',
    aliases: ['d'],
    perms: ['kira'],
    hidden: true,

    async execute(message, args) {
        if (message.author.id !== '177016697117474816') {
            message.author.send('You do not have permission to use this command');
            return;
        }

        let amount = 2;
        args.find(arg => {
            if (Number(arg)) {
                amount = Number(arg) + 1;
            }
        });

        //If the channel is not a text channel then we cant bulkdelete so return
        if (message.channel.type !== "text") return;

        message.channel
            .bulkDelete(amount)
            .then(deleted => {
                console.log(chalk.bgMagenta.bold(`Deleted ${deleted.size} messages`));
            })
            .catch(err => {
                console.error(chalk.bgRed.bold(err));
            });
    },
};
