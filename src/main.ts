import { Client } from "discord.js";
import { token } from "./config";
import { init as initDb } from "./db/dbSetup";
import { Init } from "./util/CommandUtil";
import { init as emojiInit } from "./util/Emoji";
import { OnMessage } from "./util/MessageHandler";
const client = new Client();

client.once("ready", async () => {
  console.log(`${client.user.username} online :3`);
  emojiInit(client);
  Init();
});

client.on("message", message => {
  OnMessage(message);
});

async function login() {
  await initDb();
  client.login(token);
}

login();
