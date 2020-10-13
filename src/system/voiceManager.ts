import chalk from 'chalk';
import { Client } from 'discord.js';

import { coders_club_id } from '../config';

export async function initVoiceManager(client: Client) {
    const coders_club = client.guilds.cache.get(coders_club_id);
    if (!coders_club) return;

    const voice_role = coders_club.roles.cache.get('642540366935097365');
    if (!voice_role) return;

    coders_club.members.cache.map(async member => {
        if (member.roles.cache.has(voice_role.id)) {
            member.roles
                .remove(voice_role)
                .then(() => {})
                .catch(err => console.log(chalk.bgRed(`Failed to remove voice role`), `REASON: ${err}`));
        }
    });

    //Check if their are any people in voice, and add the voice role incase the bot was offline
    coders_club.voiceStates.cache.map((voiceState, key) => {
        const member = voiceState.member;

        member.roles
            .add(voice_role)
            .then(() => {})
            .catch(err => console.log(chalk.bgRed.bold(`Error trying to add vc role`), `REASON ${err}`));
    });

    //Add's the voice role when user's joins a voice-channel and also removes the role when members leave a voice-channel
    client.on('voiceStateUpdate', (oldMember, newMember) => {
        const member = (oldMember || newMember).member;

        if (member.guild.id !== coders_club_id) {
            return;
        }

        const oldChannel = oldMember.channel;
        const newChannel = newMember.channel;

        if (!oldChannel && newChannel) {
            //User joined a vc
            member.roles
                .add(voice_role)
                .then(() => {})
                .catch(err => console.log(chalk.bgRed.bold(`Error trying to add vc role`), `REASON ${err}`));
        } else if (!newChannel) {
            //User left vc
            member.roles
                .remove(voice_role)
                .then(() => {})
                .catch(err => console.log(chalk.bgRed(`Failed to remove voice role`), `REASON: ${err}`));
        }
    });
}
