import { Command } from '../../classes/Command';

const videoUrl = 'https://cdn.discordapp.com/attachments/702091543514710027/852076662401269790/vtuber.mp4';

export const command: Command = {
   name: 'vtuber',
   aliases: ['jerma'],
   description: 'bonk a vtuber',

   execute(message, args) {
      message.channel.send(videoUrl);
   }
};
