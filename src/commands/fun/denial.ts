import { Command } from '../../classes/Command';

const videoLink = 'https://cdn.discordapp.com/attachments/702091543514710027/897151422863384646/9.mp4';

export const command: Command = {
   name: 'Denial',
   description: 'Some of us are in denial, and some of us are... 😳',
   aliases: ['inyourmom', '9inches'],
   async execute(message, args) {
      const msg = await message.channel.send(videoLink);
      msg.react('💅');
   }
};
