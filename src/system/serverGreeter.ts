import { GuildMember, Client, PartialGuildMember, TextChannel } from 'discord.js';
import { coders_club_id } from '../config';

export function initGreeter(client: Client) {
    client.on('guildMemberAdd', member => greetMember(member));
}

function greetMember(member: GuildMember | PartialGuildMember) {
    // Check if member is from coders club
    if (member.guild.id !== coders_club_id) return;

    // setup content message
    let content = `>>> Welcome **${member.toString()}**`;
    content += `\nYou can pick out some roles from **<#618438576119742464>**`;

    // get welcome channel
    const channel = member.guild.channels.cache.get('647099246436286494');
    if (!channel) return;
    if (channel instanceof TextChannel) channel.send(content);
}
