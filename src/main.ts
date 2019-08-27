import { Client } from "discord.js";
import { token } from "./config";
import { init as initDb } from "./db/dbSetup";
import { Init as cmdInit } from "./util/CommandUtil";
import { init as emojiInit } from "./util/Emoji";
import { OnMessage } from "./util/MessageHandler";
const client = new Client();

client.once("ready", () => {
  console.log(`${client.user.username} online :3`);
  cmdInit();
  emojiInit(client);
});

client.on("message", message => {
  OnMessage(message);
});

async function login() {
  await initDb();
  client.login(token);
}

login();
