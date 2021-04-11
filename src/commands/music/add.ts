import { ICommand } from '../../classes/Command';
import { onSongRequest } from '../../util/musicUtil';

export const command: ICommand = {
    name: 'add',
    description: 'add song to queue',
    usage: '[url | search]',
    args: true,

    async execute(message, args) {
        onSongRequest(message, args, true)
    }
}