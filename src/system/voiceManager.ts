import { Client, VoiceChannel } from 'discord.js';
import { logger, mikaelaId } from '../app';
import { findPlayer } from '../util/musicUtil';

export async function initVoiceManager(client: Client) {
   const voiceManager = new VoiceManager(client);

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
         return;
      }

      // User left vc
      if (!newChannel) {
         voiceManager.onVoiceLeave(oldChannel);
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
