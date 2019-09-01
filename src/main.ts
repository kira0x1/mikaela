import { Client } from "discord.js";
import { createConnection } from "mongoose";
import { dbLogin, token } from "./config";
import { Init as cmdInit } from "./util/CommandUtil";
import { init as emojiInit } from "./util/Emoji";
import { OnMessage } from "./util/MessageHandler";
import { debugUsers, initUsers } from "./db/dbUser";
import { initUserSongs } from "./db/dbFavorites";
import { dbinit } from "./db/dbSetup";

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
  console.log(`connecting to db`);
  await dbinit();
  console.log(`connection done`);

  client.login(token);
}

init();
// client.login(token);
