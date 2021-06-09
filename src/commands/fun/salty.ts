import { Command } from '../../classes/Command';

const videoUrl =
   'https://cdn.discordapp.com/attachments/702091543514710027/852076640062537728/salty_with_raccoon_on_head_2.mp4';

export const command: Command = {
   name: 'Salty',
   aliases: ['raccoon', 'Cutest person in the whole wide world'],
   description: 'Cutie with a raccoon on their head',

   execute(message, args) {
      message.channel.send(videoUrl);
   }
};
