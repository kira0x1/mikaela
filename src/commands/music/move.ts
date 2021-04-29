import { Command } from '../../classes/Command';
import { Song } from "../../classes/Song";
import { getPlayer } from '../../util/musicUtil';
import { createFooter, embedColor, quickEmbed, wrap } from '../../util/styleUtil';
import { sendArgsError } from '../../util/commandUtil';



export const command: Command = {
    name: 'Move',
    description: 'Move a songs position in the Queue',
    args: true,
    usage: '[song position] [desired position]',

    execute(message, args) {
        const player = getPlayer(message)
        if (player.getQueueCount() === 0) return quickEmbed(message, 'Queue is empty')

        if (args.length < 2) return sendArgsError(this, message)

        let songPos: string | number = args.shift();
        let toPos: string | number = args.shift();

        songPos = Number(songPos)
        toPos = Number(toPos)

        if (songPos === toPos) return quickEmbed(message, `Cannot move song to the same position`)

        songPos--;
        toPos--;

        const songSelected = player.queue.songs[songPos]
        const otherSong = player.queue.songs[toPos]

        if (!songSelected || !otherSong)
            return quickEmbed(message, 'Song position incorrect')

        player.queue.songs[toPos] = songSelected
        player.queue.songs[songPos] = otherSong

        songPos++
        toPos++

        const embed = createFooter(message)
            .setColor(embedColor)
            .setTitle(`Moved songs in queue`)
            .addField(`\u200b`, `${moveString(songSelected, toPos)}\n\n${moveString(otherSong, songPos)}\n\u200b`)

        // embed.fields.push(createEmptyField())

        message.channel.send(embed)
    }
}

function moveString(song: Song, toPos: number) {
    let to: string = wrap(toPos.toString())
    return `**Moved Song:**  ${song.title}\n**To Position: ${to}**`
}

