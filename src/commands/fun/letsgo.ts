import { Command } from '../../classes/Command';

const video = 'https://cdn.discordapp.com/attachments/702091543514710027/848101086425907238/letsgo.mp4';

export const command: Command = {
   name: 'LetsGo',
   description: 'LEEEETS FUCKIIIIIING GOOOOOOOOOOOOOOOOO',
   aliases: ['LetsFuckingGo'],
   execute(message, args) {
      message.channel.send(video);
   }
};
