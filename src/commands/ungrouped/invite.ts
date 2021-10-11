import { Command } from '../../classes/Command';

const inviteLink =
   'https://discordapp.com/api/oauth2/authorize?client_id=585874337618460672&permissions=37038144&scope=bot';

export const command: Command = {
   name: 'Invite',
   description: 'Links mikaela discord invite',
   aliases: [],

   async execute(message, args) {
      message.channel.send(`> **Invite Mikaela to your server**\n${inviteLink}`);
   }
};
