import { Command } from '../../classes/Command';

const dogeHorny = 'https://cdn.discordapp.com/attachments/285778400956645376/752686497592770651/wench.mp4';
const dogeBonk =
   'https://cdn.discordapp.com/attachments/419976078321385473/736559596155699290/fetchimage.png';
const iJustWantToBeHappy =
   'https://cdn.discordapp.com/attachments/702091543514710027/893780261983096883/i_just_want_to_be_happy.webm';

const links = [dogeBonk, dogeHorny, iJustWantToBeHappy];

export const command: Command = {
   name: 'Horny',
   description: 'Posts a response chosen at random to horny people 😳',

   execute(message, args) {
      const choice = Math.floor(Math.random() * links.length);
      message.channel.send(links[choice]);
   }
};
