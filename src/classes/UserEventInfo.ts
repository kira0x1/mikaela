import { Message, User } from 'discord.js';
import { createFooter } from '../util/styleUtil';

export interface UserEventInfo {
   type: UserEventType;
   issuer: User;
   receiver: User;
   timestamp?: Date;
   reason?: string;
   deleteMessageDays?: number;
   color?: number;
}

export enum UserEventType {
   Kick,
   Ban,
   Unban
}

export function typeToString(eventType: UserEventType): string {
   switch (eventType) {
      case UserEventType.Ban:
         return 'Banned';
      case UserEventType.Kick:
         return 'Kicked';
      case UserEventType.Unban:
         return 'Unbanned';
   }
}

export function toEmbed(message: Message, eventInfo: UserEventInfo) {
   const msg = typeToString(eventInfo.type);

   let embed = createFooter(message)
      .setTitle(msg)
      .setDescription(`${message.author} ${msg.toLowerCase()} ${eventInfo.receiver}`)
      .addField(`${msg} user ID`, `\`${eventInfo.receiver.id}\``)
      .setThumbnail(eventInfo.receiver.displayAvatarURL({ dynamic: true }));

   if (eventInfo.reason) {
      embed.addField('Reason', eventInfo.reason);
   }
   if (eventInfo.timestamp) {
      embed.setTimestamp(eventInfo.timestamp);
   }
   if (eventInfo.color) {
      embed.setColor(eventInfo.color);
   }
   if (eventInfo.deleteMessageDays) {
      embed.addField('Delete message days', eventInfo.deleteMessageDays);
   }

   return embed;
}
