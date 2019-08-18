import { Client, Collection, Emoji, Message } from 'discord.js'
import { ISong } from '../db/song'
import { AddUserSong } from '../db/userSongs'
const ms = require('ms')

const reactionDuration = ms(`5m`)

//Emojis in collection
let emojis: Collection<string, Emoji> = new Collection()
export const sweat = '😰'

export function init(client: Client) {
    client.emojis.map(emoji => emojis.set(emoji.name, emoji))
}

export function getEmoji(name: string) {
    return emojis.get(name)
}

export async function FavoritesHandler(message: Message, emojiName: string, song: ISong) {
    const emoji = getEmoji(emojiName)

    const filter = (reaction, user) => {
        return reaction.emoji.name === emoji.name && !user.bot
    }

    message.react(emoji)
    const collector = message.createReactionCollector(filter, { time: reactionDuration })

    collector.on('collect', async (reaction, reactionCollector) => {
        const user = reaction.users.last()
        AddUserSong({ tag: user.tag, id: user.id, nickname: user.username }, song)
    })

    collector.on('end', collected => {
        message.clearReactions()
    })
}
