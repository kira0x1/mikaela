import { Connection, createConnection } from "mongoose"
import { dbLogin } from "../config"
import { initSongs } from "./dbSong"
import { initUsers } from "./dbUser"
import { initUserSongs } from "./dbFavorites"

export var conn: Connection | undefined = undefined

init()

async function init() {
  conn = await createConnection(dbLogin, {
    useNewUrlParser: true,
    useCreateIndex: true,
    keepAlive: true,
  })

  await initUsers()
  await initUserSongs()
  await initSongs()
}

export { init }
