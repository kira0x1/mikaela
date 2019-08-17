import { Connection, createConnection } from 'mongoose';
import { dbLogin } from '../config';
import { initSongs } from './song';
import { initUsers } from './user';
import { initUserSongs } from './userSongs';


export var conn: Connection | undefined = undefined

init()


async function init() {
  conn = await createConnection(dbLogin, {
    useNewUrlParser: true,
    useCreateIndex: true,
    keepAlive: true,
  });


  await initUsers()
  await initUserSongs()
  await initSongs()
}

export { init };
