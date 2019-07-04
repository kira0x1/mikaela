const discord = require('discord.js');
const search = require('youtube-search');
const ytdl = require('ytdl-core');
const { usage } = require('../util/util');
const { prefix } = require('../config.json');

const searchOptions = {
  part: ['snippet', 'contentDetails'],
  chart: 'mostPopular',
  maxResults: 1,
  key: 'AIzaSyAQ_I6nDdIahO4hWerAQ32P4UXFf21_ELo'
};

let conn;
let currentSong;

const flags = [
  (play = { name: 'play', aliases: ['play', 'p'] }),
  (pause = { name: 'pause', aliases: ['pause', 'hold', 'ps'] }),
  (exit = { name: 'exit', aliases: ['stop', 'exit', 'quit', 'lv', 'leave'] }),
  (resume = { name: 'resume', aliases: ['resume', 'rs'] }),
  (skip = { name: 'skip', aliases: ['skip', 'sk', 'fs'] }),
  (queueFlag = { name: 'queue', aliases: ['queue', 'q', 'list'] }),
  (current = { name: 'current', aliases: ['current', 'np'] }),
  (remove = { name: 'remove', aliases: ['remove', 'r'] })
];

let queue = [];

class songInfo {
  constructor(link, title) {
    this.link = link;
    this.title = title;
  }
}

module.exports = {
  name: 'music',
  aliases: [] + flags.map(f => f.aliases),
  guildOnly: true,
  usage: `[link | search] or [flag]`,
  cooldown: 3,
  description: `Plays music via links or youtube searches`,

  execute(message, args) {
    const query = args.join(' ');
    const arg = message.content
      .slice(prefix.length)
      .split(/ +/)
      .shift();

    const vc = message.member.voiceChannel;

    let flag =
      flags.find(f => f.name === arg) ||
      flags.find(f => f.aliases && f.aliases.includes(arg));
    status = 'play';

    if (flag && flag.name !== 'play') {
      if (flag.name === 'exit') {
        status = 'end';
        stop();
      } else if (flag.name === 'pause') {
        pause();
      } else if (flag.name === 'resume') {
        resume();
      } else if (flag.name === 'skip') {
        status = 'skip';
        playNext();
      } else if (flag.name === 'queue') {
        showQueue();
      } else if (flag.name === 'current') {
        nowPlaying();
      } else if (flag.name === 'remove') {
        removeSong();
      }
      return;
    }

    if (!query) return reply(usage(this));
    if (!vc) return reply('You\'re not in a vc');

    //Check if its a link
    ytdl.getBasicInfo(query)
      .then(song =>
        addSong(song.video_url, song.title, song.length_seconds / 60)
      )
      .catch(() => findVideo(query)); //If not link then search

    //Search Function
    function findVideo(query) {
      search(query, searchOptions)
        .then(data => {
          song = data.results[0];
          addSong(song.link, song.title);
        })
        .catch(() => {
          reply(`**Couldnt find video:** *${query}*`);
        });
    }

    //Play Function
    function play() {
      currentSong = queue[0];
      let url = currentSong.link;

      vc.join().then(connection => {
        const stream = ytdl(url, { filter: 'audioonly' });
        const dispatcher = connection.playStream(stream, { volume: 0.3, seek: 0, passes: 1 });

        conn = dispatcher;
        dispatcher.on('end', reason => onSongFinished(reason));
      });
    }

    function resume() {
      if (conn && currentSong) {
        if (!conn.paused) return reply('Song is currently not paused');
        reply('resuming!');
        conn.resume();
      } else {
        reply('No song to resume');
      }
    }

    function onSongFinished(reason) {
      if (reason !== 'user' && reason !== undefined) {
        playNext();
      }
    }

    function playNext() {
      let song = queue.shift();
      if (queue.length === 0 || !song) {
        return stop();
      }
      play();
    }

    function addSong(link, title) {
      queue.push({ link, title });
      reply(`Added song: **${title}** to queue`);
      if (currentSong === undefined) play();
    }

    function pause() {
      if (conn && currentSong) {
        reply(`Paused: ${currentSong.title}`);
        conn.pause();
      }
    }

    function stop() {
      queue = [];
      currentSong = undefined;
      vc.leave();
      conn.stop();
    }

    function removeSong() {
      let songID = args[0];
      if (songID === undefined || isNaN(songID)) {
        let hasQ = showQueue();
        if (hasQ === false) return;
        reply('`Enter songs position: `');

        const filter = m => isNaN(m.content) === false;
        const collector = message.channel.createMessageCollector(filter, {
          time: 10000
        });

        collector.on('collect', m => {

          if (m < 1 || m > queue.length) {
            collector.stop();
            return reply('No song in that position!');
          }

          if (m === 1) {
            playNext();
          } else {
            m--;
            queue.splice(m, 1);
          }
          collector.stop();
        });
      }
    }

    function nowPlaying() {
      if (currentSong) {
        let embed = new discord.RichEmbed()
          .setTitle('Currently Playing')
          .addField(currentSong.title, currentSong.link)
          .setColor(0xc71459)

        reply('', { embed: embed });
      } else {
        reply(`No song is playing right now...`);
      }
    }

    function showQueue() {
      if (!hasQueue()) {
        send(`Queue empty...`);
        return false;
      }

      let embed = new discord.RichEmbed().setTitle(
        'Queue\nCurrently Playing: ' + currentSong.title
      ).setColor(0xc71459)

      for (let i = 0; i < queue.length; i++) {
        embed.addField(i + 1, queue[i].title + '\n' + queue[i].link);
      }

      send(embed);
      return true;
    }

    function hasQueue() {
      return !(queue.length === 0 || queue === undefined);
    }

    function reply(content) {
      message.reply(content);
    }

    function send(content) {
      message.channel.send(content);
    }
  }
};
