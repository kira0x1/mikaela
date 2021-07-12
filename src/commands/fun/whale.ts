import { Command } from '../../classes/Command';

const link = 'https://tenor.com/view/shark-pog-shark-pog-poggers-basking-gif-19528569';

export const command: Command = {
   name: 'Whale',
   description: 'Posts based whale that lilly likes 💙',
   aliases: ['lilly', 'pogfish', 'fish'],
   execute(message, args) {
      message.channel.send(link);
   }
};
