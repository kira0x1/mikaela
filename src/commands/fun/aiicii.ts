import { Command } from '../../classes/Command';

const videoUrl = 'https://cdn.discordapp.com/attachments/702091543514710027/878497688222584872/duck.gif';

export const command: Command = {
   name: 'aiicii',
   aliases: ['aici'],
   description: 'A command that posts a picture of aiicii 🥰🦆',

   async execute(message, args) {
      const msg = await message.channel.send(videoUrl);
      msg.react('🦆');
   }
};
