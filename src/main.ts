import { Client } from "discord.js";
import { token } from "./config";
import { init as initDb } from "./db/dbSetup";
import { Init, log } from "./util/CommandUtil";
import { init as emojiInit } from "./util/Emoji";
import { OnMessage } from "./util/MessageHandler";
const client = new Client();

client.once("ready", async () => {
  log(`${client.user.username} online :3`);
  emojiInit(client);
  Init();
  await initDb();
});

client.on("message", message => {
  OnMessage(message);
});

client.login(token);
