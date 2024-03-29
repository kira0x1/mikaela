import { Guild, Message, User } from 'discord.js';
import { prefixes } from '../database/api/serverApi';

export async function getTargetMember(message: Message, query: string) {
   query = query.toLowerCase();

   const mentions = message.mentions.members;
   let mention = message.mentions.members.first();

   if (mention.user.bot) {
      mention = mentions[1];
   }

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
