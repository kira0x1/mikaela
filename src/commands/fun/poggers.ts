import { Command } from '../../classes/Command';

const pogLink = 'https://cdn.discordapp.com/attachments/709803931878031404/751941837673201684/Poggers.mp4';

export const command: Command = {
   name: 'poggers',
   description: 'Posts a poggie woggie',
   aliases: ['poggie', 'pog', 'pogger'],

   execute(message, args: string[]) {
      message.channel.send(pogLink);
   }
};
