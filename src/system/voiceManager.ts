import { Client, VoiceChannel } from 'discord.js';
import { mikaelaId } from '../app';

import { coders_club_id, isProduction } from '../config';
import { findPlayer } from '../util/musicUtil';
import { VoiceRoleManager } from './voiceRoleManager';

export async function initVoiceManager(client: Client) {
    const voiceManager = new VoiceManager(client);

    const codersClubVoiceManager = new VoiceRoleManager(
        client.guilds.cache.get(coders_club_id)
    );

    client.on('voiceStateUpdate', (oldMember, newMember) => {
        const member = (oldMember || newMember).member;
        const guildId = member.guild.id;

        const oldChannel = oldMember.channel;
        const newChannel = newMember.channel;

        //User joined a vc
        if (!oldChannel && newChannel) {
            if (guildId === coders_club_id && isProduction && client.user.id === mikaelaId)
                codersClubVoiceManager.emit('voice-join', member);

            return;
        }

        //User left vc
        if (!newChannel) {
            voiceManager.onVoiceLeave(oldChannel)

            if (guildId === coders_club_id && isProduction && client.user.id === mikaelaId)
                codersClubVoiceManager.emit('voice-leave', member);
        }
    });
}

class VoiceManager {
    client: Client

    constructor(client: Client) {
        this.client = client
    }

    onVoiceLeave(vc: VoiceChannel) {
        if (!this.inVc(vc)) return

        const nonbots = vc.members.filter(m => !m.user.bot)

        if (nonbots && nonbots.size !== 0) {
           return
        }

        const player = findPlayer(vc.guild.id)
        player.leave()
    }

    // is the bot in the vc?
    inVc(vc: VoiceChannel) {
        return vc.members.has(this.client.user.id)
    }
}
