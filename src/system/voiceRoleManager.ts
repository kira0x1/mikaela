import EventEmitter from 'events';
import { Guild, GuildMember, Role } from 'discord.js';
import { logger, mikaelaId } from '../app';
import chalk from 'chalk';
import { isProduction } from '../config';

export class VoiceRoleManager extends EventEmitter {
   guild: Guild;
   voiceRole: Role;

   constructor(guild: Guild) {
      super();

      this.guild = guild;

      // This is called on voice manager creation, i.e when the bot starts
      if (this.guild.client.user.id !== mikaelaId) return;
      this.refreshVoiceRole();

      if (!this.voiceRole) {
         logger.warn(`no voice role found for guild: ${guild.name}`);
         return;
      }

      this.on('voice-leave', this.removVoiceRole);
      this.on('voice-join', this.addVoiceRole);
   }

   async refreshVoiceRole() {
      this.voiceRole = this.guild.roles.cache.find(r => r.name.toLowerCase() === 'voice');

      if (!isProduction) return

      this.removeVoiceRoleFromAll();

      //Check if their are any people in voice, and add the voice role incase the bot was offline
      this.addVoiceRoleToAll();
   }

   // adds voice role to all members currently in a vc
   async addVoiceRoleToAll() {
      this.guild.voiceStates.cache.map(voiceState => {
         this.addVoiceRole(voiceState.member);
      });
   }

   // Remove the voice role from everyone not in a vc
   async removeVoiceRoleFromAll() {
      this.guild.members.cache
         .filter(member => member.roles.cache.has(this.voiceRole.id) && !member.voice)
         .map(this.removVoiceRole);
   }

   removVoiceRole(member: GuildMember) {
      member.roles
         .remove(this.voiceRole)
         .catch(err =>
            logger.error(chalk.bgRed(`Failed to remove voice role\nREASON: ${err.message}`))
         );
   }

   addVoiceRole(member: GuildMember) {
      member.roles
         .add(this.voiceRole)
         .catch(err =>
            logger.error(chalk.bgRed.bold(`Error trying to add vc role\nREASON: ${err.message}`))
         )
   }
}
