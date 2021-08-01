import { Command } from '../../classes/Command';

const videoLink =
   'https://cdn.discordapp.com/attachments/702091543514710027/871414906757480508/Bootonanny.mp4';

export const command: Command = {
   name: 'Bootonanny',
   description: 'Bootonanny?',
   aliases: ['boo', 'botonany', 'seesaw', 'moorgan'],
   async execute(message, args) {
      message.channel.send(videoLink);
   }
};
