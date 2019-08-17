import { Collection, Message, RichEmbed, GuildMember, User } from 'discord.js';
import { ISong } from '../db/song';
import { FindOrCreate, IUser, users } from '../db/user';
import { AddUserSong, GetUserSongs } from '../db/userSongs';
import { Command, Flag } from '../objects/Command';
import { GetSong, Player } from '../objects/song';
import { GetMessage } from '../util/MessageHandler';
import { QuickEmbed, embedColor } from '../util/Style';
import { info } from 'winston';
import { player } from './music';


const ms = require('ms')


const flags: Flag[] = [
  { name: 'list', aliases: ['ls', 'l'] },
  { name: 'add', aliases: ['a'] },
  { name: 'play', aliases: ['p'] },
  { name: 'info', aliases: ['i'] },
]

export const command: Command = {
  name: 'favorite',
  description: 'Favorite songs',
  aliases: ['fav', 'f'],
  cooldown: 3,

  async execute(message, args) {

    message.channel.startTyping()

    let msg = args.shift()
    let flag = flags.find(f => f.name === msg || f.aliases && f.aliases.includes(msg))

    if (flag) {
      switch (flag.name) {
        case 'list':
          await ListFavorites(args)
          break;

        case 'add':
          if (!args || args && args.length === 0) return QuickEmbed(`no songs given`)
          AddSong(args)
          break;

        case 'info':
          if (!args || args && args.length < 1) return QuickEmbed(`no arguments given`)
          Info(args)
          break;
        case 'play':
          player.Play(args.join(), message)
          break;
      }

    }

    message.channel.stopTyping()
  }
};


async function Info(args: string[]) {
  if (args.length > 14) return QuickEmbed(`Too many arguments given`)

  let songIndex: number | undefined = undefined

  if (args.length === 1)
    songIndex = Number(args.shift())
  else
    args.find((arg, pos) => {
      if (Number(arg)) {
        songIndex = Number(arg)
        args.splice(pos, 1)
        return
      }
    })

  if (songIndex === undefined) return QuickEmbed(`no song index given`)

  let user = undefined
  const usersMentioned = GetMessage().mentions.members
  if (usersMentioned && usersMentioned.size > 0) user = usersMentioned.first()

  if (!user) {
    let userName = args.join()
    // / message.guild.members.find(usr => usr.displayName.toLowerCase() === displayName.toLowerCase())
    let user: GuildMember | User = GetMessage().channel.guild.members.find(usr => usr.displayName.toLowerCase() === userName.toLowerCase())
    if (!user) {
      user = GetMessage().author
    }

    const userResult = users.get(user.id)
    if (!userResult) return QuickEmbed(`user not found`)

    const fav = userResult.favorites
    songIndex--
    if (fav.length < songIndex) return QuickEmbed(`song not found`)

    const song = fav[songIndex]
    let embed = new RichEmbed()
      .setTitle(song.title)
      .setDescription(song.duration.duration + `\n<${song.url}>`)
      .setColor(embedColor)

    GetMessage().channel.send(embed)
  }
}


async function AddSong(args: string[]) {
  const song = await GetSong(args.shift())
  if (!song) return QuickEmbed('song not found')

  const author = GetMessage().author

  const user: IUser = { nickname: author.username, tag: author.tag, id: author.id }
  await FindOrCreate(user)
  AddUserSong({ tag: user.tag, id: user.id, nickname: user.nickname }, song)
}

const maxSongs: number = 5

async function ListFavorites(args: string[]) {

  let author: undefined | User = undefined || GetMessage().mentions.users.first()

  if (args && !author) {
    if (args.length > 0) {
      let name = args.shift()
      const member = GetMessage().guild.members.find(usr => usr.displayName.toLowerCase() === name)
      if (!member) return QuickEmbed(`user not found`)
      author = member.user
    }
  }

  if (!author)
    author = GetMessage().author

  const id = author.id
  const fav = await GetUserSongs(id)

  const pages: Collection<number, ISong[]> = new Collection()

  let currentPage = 0
  let songsInPage = 0

  let embed = new RichEmbed()

  if (!fav) return QuickEmbed(`no favorites`)

  for (let i = 0; i < fav.length; i++) {
    const song: ISong = fav[i]
    if (!pages.get(currentPage)) {
      pages.set(currentPage, [])
    }

    pages.get(currentPage).push(song)

    songsInPage++

    if (songsInPage >= maxSongs) {
      songsInPage = 0
      currentPage++
    }
  }

  currentPage = 0
  embed.setThumbnail(author.avatarURL)
    .addField(`\n\n***Favorites***\nPage **${currentPage + 1}**\nTotal Songs **${pages.get(currentPage).length}**`, '\u200b')
    .setColor(embedColor)

  pages.get(currentPage).map((s, pos) => embed.addField(`**${pos + 1}\t${s.title}**`, 'Duration: ' + s.duration.duration))

  const msgTemp = await GetMessage().channel.send(embed)

  if (pages.size <= 1) return

  let msg: undefined | Message = undefined
  if (!Array.isArray(msgTemp))
    msg = msgTemp

  if (!msg) return
  msg.react('⬅').then(() => msg.react('➡'))

  const filter = (reaction, user) => {
    return (reaction.emoji.name === '➡' || reaction.emoji.name === '⬅') && !user.bot
  }

  const collector = msg.createReactionCollector(filter, { time: ms('15m') })
  collector.on('collect', async r => {
    if (r.emoji.name === '➡') {
      currentPage++
      if (currentPage >= pages.size) currentPage = 0
    }
    else if (r.emoji.name === '⬅') {
      currentPage--
      if (currentPage < 0) currentPage = pages.size - 1
    }

    r.remove(r.users.last())

    const newEmbed = new RichEmbed()
      .setThumbnail(author.avatarURL || author.avatarURL)
      .addField(`\n\n***Favorites***\nPage **${currentPage + 1}**\nTotal Songs **${pages.get(currentPage).length}**`, '\u200b')
      .setColor(embedColor)

    pages.get(currentPage).map((s, pos) => newEmbed.addField(`**${(pos + 1) + (currentPage * maxSongs)}\t${s.title}**`, 'Duration: ' + s.duration.duration))
    await msg.edit(newEmbed)

  })
}

async function DebugFav() {
  const id = GetMessage().author.id
  const fav = await GetUserSongs(id)
  console.dir(fav)
}
