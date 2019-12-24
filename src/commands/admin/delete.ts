import { ICommand } from '../../classes/Command';
import chalk from 'chalk';

export const command: ICommand = {
    name: 'delete',
    description: "Deletes messages",
    usage: "[amount]",
    aliases: ["d"],
    perms: ["admin"],
    hidden: true,

    async execute(message, args) {
        let amount = 2
        args.find(arg => {
            if (Number(arg)) {
                amount = Number(arg) + 1
            }
        })

        message.channel.bulkDelete(amount).then(deleted => {
            console.log(chalk.bgMagenta.bold(`Deleted ${deleted.size} messages`))
        }).catch(err => {
            console.error(chalk.bgRed.bold(err))
        })
    }
}