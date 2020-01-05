import { Client, Collection, GuildMember, User } from 'discord.js';
import { model, Schema } from 'mongoose';
import { ISong } from '../classes/Player';
import { conn } from "./database";

export var users: Collection<string, IUser> = new Collection()

export interface IRole {
    name: string,
    id: string,
}


export interface IUser {
    username: string,
    id: string,
    tag: string,
    roles: IRole[],
    favorites: ISong[]
}


export const UserSchema = new Schema({
    username: { type: String, required: true },
    id: { type: String, required: true },
    tag: { type: String, required: true },
    roles: { type: [{ name: String, id: String }], required: true },
    favorites: { type: Array<ISong>(), required: false },
    createdAt: Date
})

export const userModel = model("users", UserSchema)


//Create a UserModel and insert it into the database, returns an error if the user already exists
export function CreateUser(user: IUser | GuildMember) {
    var usersModel = conn.model("users", UserSchema);

    if (user instanceof GuildMember) {
        const memberUser: IUser = {
            username: user.user.username,
            tag: user.user.tag,
            id: user.id,
            favorites: [],
            roles: []
        }
        console.log(`creating user: ${memberUser.username}`);
        return userModel.create(memberUser)
    } else {
        console.log(`creating user: ${user.username}`);
        return usersModel.create(user);
    }
}

// const usersJson = require('../../usersongs.json')
// export async function InitUsers(client: Client) {
//     usersJson.users.map(user => {
//         CreateUser(user)
//     })
// }

// async function writeUsersToJSON(client: Client) {
//     const collections = await conn.db.collections()
//     const usersongs = collections.find(col => col.collectionName === "usersongs")
//     const users = collections.find(col => col.collectionName === "users")

//     if (!users || !usersongs) return

//     let usersFound: IUser[] = []
//     let userIds: string[] = []

//     await users.find().forEach(userData => {
//         userIds.push(userData.id)
//     })

//     userIds.map(async id => {
//         const user = client.users.find(usr => usr.id === id)
//         if (user) {
//             let iuser: IUser = {
//                 username: user.username,
//                 id: user.id,
//                 tag: user.tag,
//                 roles: [],
//                 favorites: []
//             }
//             usersFound.push(iuser)
//         }
//     })


//     let songsJson = `{"users": [`

//     for (let i = 0; i < usersFound.length; i++) {
//         const userFound = usersFound[i]
//         const user = mapUser(userFound.id, client)
//         if (user) {
//             songsJson += `{"username": "${userFound.username}",`
//             songsJson += `"id": "${userFound.id}",`
//             songsJson += `"tag": "${userFound.tag}",`
//             songsJson += `"roles": [],`
//             songsJson += `"favorites":[`
//             await usersongs.find({ userId: userFound.id }).toArray().then(songs => {
//                 songs.map((data, index) => {
//                     const song = data.song
//                     const isong: ISong = {
//                         title: song.title,
//                         id: song.id,
//                         url: song.url,
//                         duration: song.duration
//                     }

//                     songsJson += JSON.stringify(isong)
//                     if (index < songs.length - 1) songsJson += ","
//                 })
//             })
//             songsJson += `]}`
//             if (i < usersFound.length - 1)
//                 songsJson += ","
//         }
//     }
//     songsJson += `]}`
//     writeFileSync(path.join(__dirname, `..`, `..`, `usersongs.json`), songsJson)
// }

function mapUser(id: string, client: Client): User | undefined {
    return client.users.find(user => user.id === id)
}