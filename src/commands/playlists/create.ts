import { Command } from '../../classes/Command';
import { createPlaylist } from '../../database/api/playlistApi';
import { findOrCreate } from '../../database/api/userApi';

export const command: Command = {
   name: 'create',
   description: 'Create a new playlist',
   args: true,
   isSubCommand: true,

   async execute(message, args) {
      let description = '';

      const argsGiven = args.join(' ').split(',');
      const title = argsGiven[0];
      if (argsGiven.length > 1) {
         description = argsGiven[1];
      }

      const author = await findOrCreate(message.author);
      createPlaylist(author._id, title, description);
   }
};
