import { Command } from '../../classes/Command';

const videoLink = 'https://cdn.discordapp.com/attachments/702091543514710027/867384916009549844/froggy.mp4';

export const command: Command = {
   name: 'Froggy',
   description: 'Froggy 🐸',
   aliases: ['frog'],
   async execute(message, args) {
      const msg = await message.channel.send(videoLink);
      msg.react('🐸');
   }
};
