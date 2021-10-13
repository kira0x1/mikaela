import { Client, Emoji, Guild, Message, User } from 'discord.js';
import { logger } from '../app';
import { coders_club_id } from '../config';
import { prefixes } from '../database/api/serverApi';
import axios, { AxiosRequestConfig } from 'axios';

export let heartEmoji: Emoji;
export let trashEmoji: Emoji;

export function initEmoji(client: Client) {
   const coders_club = client.guilds.cache.get(coders_club_id);
   if (!coders_club) return;

   heartEmoji = getEmojiFromGuild(coders_club, 'heart');
   trashEmoji = getEmojiFromGuild(coders_club, 'delete');
}

export function getEmojiFromGuild(guild: Guild, emojiName: string) {
   const emoji = guild.emojis.cache.find(em => em.name.toLowerCase() === emojiName.toLowerCase());
   if (!emoji) logger.warn(`emoji not found`);
   return emoji;
}

export async function getTargetMember(message: Message, query: string) {
   query = query.toLowerCase();

   const mention = message.mentions.members.first();
   if (mention !== undefined) return mention;

   const guild = message.guild;

   let member = await getMember(query, guild);
   return member;
}

export async function getTarget(message: Message, query: string): Promise<User> {
   const member = await getTargetMember(message, query);
   if (member) return member.user;
}

async function getMember(query: string, guild: Guild) {
   let member = guild.members.cache.find(m => m.displayName.toLowerCase() === query || m.id === query);

   if (member) return member;

   // If member wasnt found either due to a typo, or the member wasnt cached then query query the guild.
   const memberSearch = await guild.members.fetch({ query: query, limit: 1 });

   if (memberSearch?.first()) return memberSearch.first();
}

export function findRole(message: Message, query: string) {
   return (
      message.mentions.roles?.first() ||
      message.guild.roles.cache.find(r => r.name.toLowerCase() === query || r.id === query)
   );
}

export function getPrefix(message: Message) {
   return prefixes.get(message.guild.id);
}

export interface BannerOptions {
   format?: 'png' | 'jpg' | 'gif';
   size?: 256 | 512 | 1024 | 2048 | 4096;
}

export async function getBanner(userId: string, token: string, options?: BannerOptions) {
   const config: AxiosRequestConfig = {
      url: `https://discord.com/api/v8/users/${userId}`,
      headers: {
         Authorization: `Bot ${token}`
      },
      method: 'GET'
   };

   const response = await axios.request(config);

   const data: any = response.data;
   const status = response.status;

   if (status === 401) throw new Error(`Failed to authorize, make sure the bot token is correct`);
   if (status === 404) throw new Error(`Could not find user with id: ${userId}`);

   const banner = data?.banner;
   if (!banner) return null;

   const format = banner.startsWith('a_') ? 'gif' : options?.format ? options.format : 'png';
   const size = options?.size ? options.size : '4096';

   return `https://cdn.discordapp.com/banners/${userId}/${banner}.${format}?size=${size}`;
}
