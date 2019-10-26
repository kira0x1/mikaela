import { Message, StreamDispatcher, VoiceConnection } from "discord.js";
import { QuickEmbed } from "../util/Style";

let volume = 5;

const maxVolume = 7;
const minVolume = 1;

var stream: StreamDispatcher | undefined = undefined;
var conn: VoiceConnection | undefined = undefined;
var inVoice: boolean = false;

class Player {
  ChangeVolume(amount: number) {
    changeVolume(amount);
  }

  Play() { }

  Join(message: Message) {
    joinVoice(message);
  }
  Leave(message: Message) {
    leaveVoice(message);
  }
}

function changeVolume(amount: number) {
  volume += amount;
  if (volume > maxVolume) volume = maxVolume;
  else if (volume < minVolume) volume = minVolume;
  if (stream) stream.setVolume(volume);
}

function joinVoice(message: Message) {
  const vc = message.member.voiceChannel;
  if (!vc) QuickEmbed(message, `you're not in a voice channel`);
  else if (!vc.joinable) QuickEmbed(message, `Cant join this voice channel`);
  else {
    message.member.voiceChannel.join().then(connection => {
      conn = connection;
      inVoice = true;
    });
  }
}

function leaveVoice(message: Message) {
  if (message.member.voiceChannel) message.member.voiceChannel.connection.disconnect;
  inVoice = false;
}
