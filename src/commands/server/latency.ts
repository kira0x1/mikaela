import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../../classes/Command';
import { createFooter, embedColor } from '../../util/styleUtil';

export const command: Command = {
  name: 'latency',
  description: 'Measures latency',
  aliases: ['ping'],

  async execute(message, _) {
    let embed: MessageEmbed = createFooter(message);

    embed.setTitle('Pong!');
    embed.addField('Websocket', `${message.client.ws.ping} ms`, true);
    embed.setColor(embedColor);

    let before: number = Date.now();

    const msg: Message = await message.channel.send(embed);

    const sendDelay = Date.now() - before;
    embed.addField('Send', `${sendDelay} ms`, true);

    const msgDelay = msg.createdTimestamp - message.createdTimestamp;
    embed.addField('Message', `${msgDelay} ms`, true);

    await msg.edit(embed);
  },
};
