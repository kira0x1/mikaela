import { Connection, createConnection } from "mongoose";
import { dbLogin } from "../config";
import { initSongs } from "./dbSong";
import { initUsers } from "./dbUser";
import { initUserSongs } from "./dbFavorites";

export var conn: Connection | undefined = undefined;

async function init() {
  conn = await createConnection(dbLogin, {
    useNewUrlParser: true,
    keepAlive: true
  });

  await console.log(`connected to mongodb`);

  await initUsers();
  await initUserSongs();
  await initSongs();
}

export { init };
