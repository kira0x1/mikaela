import { prefix } from '../config';
import { Command, Flag } from '../objects/command';
import { Player } from '../objects/song';

const flags: Flag[] = [
    {
        name: 'stop',
        aliases: ['quit', 'end', 'leave'],
    },
    {
        name: 'skip',
        aliases: ['fs', 's', 'next', 'n'],
    },
    {
        name: 'list',
        aliases: ['q', 'ls'],
    },
]

export const player = new Player()

const command: Command = {
    name: 'play',
    description: 'Plays music',
    aliases: ['p'],
    flags: flags,
    args: false,
    usage: '[Search | Link]',

    async execute(message, args) {
        let msg = message.content.slice(prefix.length)
        let flag = flags.find(f => f.name === msg || f.aliases && f.aliases.includes(msg))
        if (flag) {
            switch (flag.name) {
                case 'stop':
                    player.Stop()
                    break
                case 'skip':
                    player.Skip()
                    break;
                case 'list':
                    player.ListQueue()
                    break;
            }
            return
        }

        message.channel.startTyping()

        let query = args.join()

        await player.Play(query, message)
        message.channel.stopTyping()
    }
}


module.exports = { command }
