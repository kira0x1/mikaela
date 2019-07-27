const Discord = require('discord.js')
const util = require('../util/util')
const { ConvertDuration } = require('../subcommands/music_commands/musicUtil')
const ms = require('ms')

async function quickEmbed(title) {
    const embed = new Discord.RichEmbed()
        .setTitle(title)
        .setColor(0xc71459)

    await util.getCurrentMessage().channel.send(embed)
}

/**
 *
 *
 * @param {Discord.Message} message
 * @param {{ tag: userTag, user: target }} target
 * @param {Array} songs
 * @param {Number} pageAt
 */
async function pageEmbed(message, target, pages) {
    let pageAt = 0
    let pageAmount = pages.length

    let totalSongs = 0
    pages.map(pg => totalSongs += pg.songs.length)

    const embed = new Discord.RichEmbed()
        .addField(`\n\n***Favorites***\nPage **${pageAt + 1}**\nTotal Songs **${totalSongs}**`, '\u200b')
        .setThumbnail(target.user.avatarURL || target.user.user.avatarURL)
        .setColor(0xc71459)

    await embedSongs(embed, pages[pageAt].songs, pageAt)

    let msg = await message.channel.send(embed)
    await msg.react('⬅')
    msg.react('➡')

    const filter = (reaction, user) => {
        return (reaction.emoji.name === '➡' || reaction.emoji.name === '⬅') && !user.bot
    }

    const collector = msg.createReactionCollector(filter, { time: ms('10m') })
    collector.on('collect', async r => {
        if (r.emoji.name === '➡') {
            pageAt++
            if (pageAt >= pageAmount) pageAt = 0
        }
        else if (r.emoji.name === '⬅') {
            pageAt--
            if (pageAt < 0) pageAt = pageAmount - 1;
        }

        r.remove(r.users.last())

        const newEmbed = new Discord.RichEmbed()
            .setThumbnail(target.user.avatarURL || target.user.user.avatarURL)
            .addField(`\n\n***Favorites***\nPage **${pageAt + 1}**\nTotal Songs **${totalSongs}**`, '\u200b')
            .setColor(0xc71459)

        await embedSongs(newEmbed, pages[pageAt].songs, pageAt)

        await r.message.edit(newEmbed)
    })
}

/**
 *
 *
 * @param {Discord.RichEmbed} embed
 * @param {Array} songs
 */
async function embedSongs(embed, songs, pageAt) {
    songs.map((song, pos) => {
        embed.addField(`**${(pageAt * 5) + (pos + 1)}  ${song.song_title}**`, ConvertDuration(song.song_duration))
    })
}

module.exports = { quickEmbed, pageEmbed }