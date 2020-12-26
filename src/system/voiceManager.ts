import chalk from 'chalk';
import { Client, GuildMember } from 'discord.js';
import { logger } from '../app';

import { coders_club_id } from '../config';

export async function initVoiceManager(client: Client) {
    const coders_club = client.guilds.cache.get(coders_club_id);
    if (!coders_club) return;

    const voice_role = coders_club.roles.cache.get('642540366935097365');
    if (!voice_role) return;

    coders_club.members.cache.map(member => {
        if (member.roles.cache.has(voice_role.id)) removVoiceRole(member)
    });

    //Check if their are any people in voice, and add the voice role incase the bot was offline
    coders_club.voiceStates.cache.map(voiceState => {
        const member = voiceState.member;
        addVoiceRole(member)
    });

    //Add's the voice role when user's joins a voice-channel and also removes the role when members leave a voice-channel
    client.on('voiceStateUpdate', (oldMember, newMember) => {
        const member = (oldMember || newMember).member;

        if (member.guild.id !== coders_club_id) {
            return;
        }

        const oldChannel = oldMember.channel;
        const newChannel = newMember.channel;

        //User joined a vc
        if (!oldChannel && newChannel) {
            addVoiceRole(member)
            return
        }

        //User left vc
        if (!newChannel) removVoiceRole(member)

    });

    function removVoiceRole(member: GuildMember) {
        member.roles
            .remove(voice_role)
            .catch(err => logger.log('error',chalk.bgRed(`Failed to remove voice role`), `REASON: ${err}`));
    }

    function addVoiceRole(member: GuildMember) {
        member.roles
            .add(voice_role)
            .catch(err => logger.log('error',chalk.bgRed.bold(`Error trying to add vc role`), `REASON ${err}`));
    }
}