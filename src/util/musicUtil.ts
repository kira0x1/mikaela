import { Message } from 'discord.js';
import { findPlayer, setNewPlayer } from '../app';
import { IDuration, Player } from '../classes/Player';


export function ConvertDuration(duration_seconds: number | string) {
  let minutes: number = Math.floor(Number(duration_seconds) / 60);
  let seconds: number | string = Math.floor(Number(duration_seconds) - minutes * 60);
  let hours = Math.floor(minutes / 60);

  if (seconds < 10) seconds = '0' + seconds;

  const duration: IDuration = {
    seconds: seconds.toString(),
    minutes: minutes.toString(),
    hours: hours.toString(),
    duration: `${minutes}:${seconds}`,
  };

  return duration;
}

export function getPlayer(message: Message): Player {
  const guildId = message.guild.id;
  const playerFound = findPlayer(guildId)

  if (playerFound) {
    return playerFound
  }

  return setNewPlayer(guildId)
}

export async function getTarget(message: Message, username: string) {
  let userName = username.toLowerCase();

  const mention = message.mentions.users.first()
  if (mention !== undefined) return mention;

  let member = message.guild.members.cache.find(m => m.displayName.toLowerCase() === userName);
  if (member) return member.user
}
