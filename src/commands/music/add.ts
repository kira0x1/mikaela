import { ICommand } from '../../classes/Command';
import { getPlayer } from '../../app';
import { getSong } from '../../util/Api';
import { QuickEmbed } from '../../util/Style';

export const command: ICommand = {
  name: 'Add',
  description: 'Add song to queue',

  async execute(message, args) {
    //Get the guilds player
    const player = getPlayer(message);

    if (player) {
      const query = args.join(' ');

      //Get song
      getSong(query)
        .then(song => player.queue.addSong(song)) //? If the song is found add it to the queue
        .catch(err => QuickEmbed(message, 'Song not found'));
    }
  },
};
