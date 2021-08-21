import { Command } from '../../classes/Command';

const videoLink =
   'https://cdn.discordapp.com/attachments/702091543514710027/820642367203573770/victoryroyale.mp4';

export const command: Command = {
   name: 'fortnight',
   description: 'Eminem rapping fortnight victory royale song🐱',
   aliases: ['victoryroyale', 'tomatotown', 'bullet', 'hugh', 'hughmungus'],

   execute(message, args) {
      message.channel.send(videoLink);
   }
};
