import { Client, VoiceChannel } from 'discord.js';
import { logger } from '../app';
import { mikaelaId, coders_club_id, isProduction } from '../config';
import { findPlayer } from '../util/musicUtil';
import { VoiceRoleManager } from './voiceRoleManager';

export async function initVoiceManager(client: Client) {
   const voiceManager = new VoiceManager(client);

   const codersClubVoiceManager = new VoiceRoleManager(client.guilds.cache.get(coders_club_id));

   client.on('voiceStateUpdate', (oldMember, newMember) => {
      const member = (oldMember || newMember).member;
      const guildId = member.guild.id;

      const oldChannel = oldMember.channel;
      const newChannel = newMember.channel;

      // check if bot changed vc while playing, I.E dragged by a moderator to a different vc
      const player = findPlayer(guildId);
      if (!player) {
         logger.error(`Voice Manager: Player for guild: ${guildId} not found`);
         return;
      }

      if (newChannel && player.voiceChannel) {
         if (
            oldMember?.id === mikaelaId &&
            oldChannel?.id === player.voiceChannel.id &&
            newChannel.id !== player.voiceChannel.id
         ) {
            player.voiceChannel = newChannel;
            player.clearVoiceTimeout();
         }
      }

      // User joined a vc
      if (!oldChannel && newChannel) {
         voiceManager.onVoiceJoin(newChannel);

         if (guildId === coders_club_id && isProduction && client.user.id === mikaelaId)
            codersClubVoiceManager.emit('voice-join', member);

         return;
      }

      // User left vc
      if (!newChannel) {
         voiceManager.onVoiceLeave(oldChannel);

         if (guildId === coders_club_id && isProduction && client.user.id === mikaelaId)
            codersClubVoiceManager.emit('voice-leave', member);
      }
   });
}

class VoiceManager {
   public client: Client;

   constructor(client: Client) {
      this.client = client;
   }

   onVoiceJoin(vc: VoiceChannel) {
      if (!this.inVc(vc)) return;

      const player = findPlayer(vc.guild.id);
      if (player.isPlaying) player.clearVoiceTimeout();
   }

   onVoiceLeave(vc: VoiceChannel) {
      if (!this.inVc(vc)) return;
      if (vc?.members) {
         const nonbots = vc.members.filter(m => !m.user.bot);

         if (!nonbots || nonbots.size === 0) {
            const player = findPlayer(vc.guild.id);
            player.startVcTimeout();
         }
      }
   }

   // is the bot in the vc?
   inVc(vc: VoiceChannel) {
      if (vc === null) return false;
      return vc?.members?.has(this.client.user.id);
   }
}
