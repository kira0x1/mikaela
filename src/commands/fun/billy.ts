import { Command } from '../../classes/Command';

const videoUrl =
   'https://cdn.discordapp.com/attachments/702091543514710027/852076677722931210/st.co3ZcJOL4khi.mp4';

export const command: Command = {
   name: 'billy',
   aliases: ['billy harrington', 'dafeels'],
   description: 'billy 😢',

   execute(message, args) {
      message.channel.send(videoUrl);
   }
};
