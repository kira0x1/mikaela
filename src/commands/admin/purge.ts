import { ICommand } from '../../classes/Command';
import chalk from 'chalk';
import { Message } from 'discord.js';

export const command: ICommand = {
    name: 'purge',
    description: "Deletes messages",
    usage: "[id] [amount]",
    aliases: ["d"],
    perms: ["admin"],
    hidden: true,

    async execute(message, args) {
        let spam: Message[] = []
        let messageId = args.shift()
        if (!messageId) return
        const users = [
            "KingArthur",
            "WHY",
            "EggHam",
            "pepasinpena",
            "Djord74",
            "WHY",
            "WHY",
            "Meiosis",
            "WHY",
            "cristian23254",
            "WHY",
            "Assault",
            "WHY",
            "Abu",
            "WHY",
            "sal",
            "SuperAcid42",
            "Aidan",
            "StrJGsfEZy",
            "gendarmerie",
            "fbi",
            "gendarmerie",
            "Snapchat",
            "Cam",
            "robi",
            "WHY",
            "butterfinger",
            "WHY",
            "ArkaneDevil",
            "dublin",
            "caca",
            "Paradox_Rαiсhυ",
            "El",
            "zentax",
            "gendarmerie",
            "KingArthur",
            "WHY",
            "EggHam",
            "pepasinpena",
            "Djord74",
            "WHY",
            "WHY",
            "Meiosis",
            "WHY",
            "cristian23254",
            "WHY",
            "Assault",
            "WHY",
            "Abu",
            "WHY",
            "sal",
            "SuperAcid42",
            "Aidan",
            "StrJGsfEZy",
            "gendarmerie",
            "fbi",
            "gendarmerie",
            "Snapchat",
            "מור1"
        ]



        const msgCopy = await message.channel.fetchMessage(messageId)
        const messages = await message.channel.fetchMessages({ limit: 100 })


        messages.map(msg => {
            if (msg.content === msgCopy.content)
                spam.push(msg)
        })

        message.channel.bulkDelete(spam).then(done => {
            console.log("done deleting")
            console.log(done.size)
        }).catch(err => console.log(`unknown message?`))
    }
}