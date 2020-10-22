import { ICommand } from '../../classes/Command';

const birdupLinks = [
    'https://cdn.discordapp.com/attachments/642036319190646814/768836441769246720/birdup.gif',
    'https://cdn.discordapp.com/attachments/642036319190646814/768837180210282496/birdup2.gif',
    'https://cdn.discordapp.com/attachments/642036319190646814/768837194437492794/birdup3.gif'
]

export const command: ICommand = {
    name: "birdup",
    description: "BIRD UP!!! 🐤\nRandomly picks between a set of birdup gifs 🐤",
    aliases: ["bird"],

    async execute(message, args) {
        const choice = Math.floor(Math.random() * birdupLinks.length)
        message.channel.send(`> **🐤 BIRD UP 🐤**\n${birdupLinks[choice]}`)
    }
}