import { Command } from '../../classes/Command';

const videoLink = 'https://cdn.discordapp.com/attachments/702091543514710027/878501529341034496/love_u.mp4';

export const command: Command = {
   name: 'eminem',
   description: 'Eminem rapping I LOVE YOU 💖',
   aliases: ['iloveyou'],

   async execute(message, args) {
      const msg = await message.channel.send(videoLink);

      const promises = [
         msg.react('🇮'),
         msg.react('🇱'),
         msg.react('🇴'),
         msg.react('🇻'),
         msg.react('🇪'),
         msg.react('🇺'),
         msg.react('💖')
      ];

      Promise.all(promises);
   }
};
