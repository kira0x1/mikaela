import { Connection, createConnection } from "mongoose";
import { dbLogin } from "../config";
import { initUserSongs } from "./dbFavorites";
import { initSongs } from "./dbSong";
import { initUsers } from "./dbUser";

export var conn: Connection | undefined = undefined;

async function init() {
  conn = await createConnection(dbLogin, {
    useNewUrlParser: true,
    useCreateIndex: true,
    keepAlive: true
  });

  await console.log(`connected to mongodb`);

  await initUsers();
  await initUserSongs();
  await initSongs();
}

export { init as dbinit };
