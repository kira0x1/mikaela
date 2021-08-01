import { Command } from '../../classes/Command';

const videoLink =
   'https://cdn.discordapp.com/attachments/702091543514710027/871414906757480508/Bootonanny.mp4';

export const command: Command = {
   name: 'Bootonanny',
   description: ':bootonanny:',
   aliases: ['boo', 'botonany', 'seesaw', 'moorgan'],
   async execute(message, args) {
      const msg = await message.channel.send(videoLink);
      msg.react(':bootonanny:');
   }
};
