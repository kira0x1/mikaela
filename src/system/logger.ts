import { Message } from 'discord.js';
import winston from 'winston';
import * as config from '../config';

const loggerTransports = [];

loggerTransports.push(new winston.transports.Console());

const loggerFormatter = config.isProduction
   ? winston.format.combine(winston.format.timestamp(), winston.format.json())
   : winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`);

// Create logger
export const logger = winston.createLogger({
   format: loggerFormatter,
   defaultMeta: { service: 'mikaela' },
   transports: loggerTransports
});

// Compulsory error handling
logger.on('error', error => {
   console.error('Error in logger caught', error);
});

export function getContextLogger(message: Message, commandName: string) {
   if (!message.guild || !message.guild.available) {
      return logger.child({
         interactionType: 'MessagePartial',
         clientID: message.client.user.id
      });
   }

   return logger.child({
      interactionType: 'Message',
      clientID: message.client.user.id,
      guildID: message.guild.id,
      guildName: message.guild.name,
      channelID: message.channel.id,
      channelName: message.channel.type !== 'DM' ? message.channel.name : 'DM',
      userID: message.author.id,
      userName: message.author.username,
      commandName: commandName
   });
}
