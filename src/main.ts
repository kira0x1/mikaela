import { Client } from "discord.js";
import { token } from "./config";
import { dbinit } from "./db/dbSetup";
import { Init as cmdInit } from "./util/CommandUtil";
import { init as emojiInit } from "./util/Emoji";
import { OnMessage } from "./util/MessageHandler";

const client = new Client();

client.once("ready", () => {
  cmdInit();
  emojiInit(client);
  console.log(`${client.user.username} online!`);
});

client.on("message", async message => {
  OnMessage(message);
});

async function init() {
  await dbinit();
  client.login(token);
}

init();
