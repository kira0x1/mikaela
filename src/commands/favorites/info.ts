import { ICommand } from "../../classes/Command";
import { findFavorite } from "./play";
import { RichEmbed } from 'discord.js';
import { embedColor } from '../../util/Style';

export const command: ICommand = {
    name: "info",
    description: "Get a songs info",
    aliases: ["i"],
    args: true,
    usage: "",

    async execute(message, args) {
        const song = await findFavorite(message, args)
        if (!song) return console.log("song not found")

        const embed = new RichEmbed()
            .setColor(embedColor)
            .setTitle(song.title)
            .setDescription(`id: ${song.id}`)
            .addField("Duration", song.duration.duration)
            .setURL(song.url)

        message.channel.send(embed)
    }
}