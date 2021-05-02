import { Command } from '../../classes/Command';

const dogeHorny = 'https://cdn.discordapp.com/attachments/285778400956645376/752686497592770651/wench.mp4';
const dogeBonk =
   'https://cdn.discordapp.com/attachments/419976078321385473/736559596155699290/fetchimage.png';

const links = [dogeBonk, dogeHorny];

export const command: Command = {
   name: 'Horny',
   description: 'Posts a response chosen at random to horny people 😳',

   execute(message, args) {
      const choice = Math.floor(Math.random() * links.length);
      message.channel.send(links[choice]);
   }
};
