import { conn } from './database';
import { IUser, UserSchema } from './dbUser';

// - GET - /users # returns all users
// export let allUsers = () => {
//     return new Promise(function (resolve, reject) {
//         let users = User.find((err: any, users: any) => {
//             if (err) reject(err);
//             else resolve(users);
//         });
//     });
// };

// - GET - /user/{1} # returns user with id 1
export async function getUser(id: string): Promise<IUser> {
    try {
        var userModel = conn.model('users', UserSchema);
        const user: any = await userModel.findOne({ id: id })?.lean();
        return user
    } catch (err) {
        return err;
    }
}

// - PUT - /user # inserts a new user into the table
export async function addUser(user: IUser) {
    return new Promise(async function (resolve, reject) {
        var userModel = await conn.model('users', UserSchema);
        await userModel
            .create({
                username: user.username,
                id: user.id,
                tag: user.tag,
                roles: user.roles,
                favorites: user.favorites,
                sourcesGroups: user.sourcesGroups,
            })
            .then(user => {
                resolve(user);
            })
            .catch(err => reject(err));
    });
}

export async function deleteUser(tag: string) {
    return new Promise(async function (resolve, reject) {
        var userModel = await conn.model('users', UserSchema);
        userModel.deleteOne({ tag: tag }, (err: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(`Successfuly Deleted User`);
            }
        });
    });
}

export async function updateUser(id: string, user: IUser) {
    try {
        console.log('updating user...')
        var userModel = conn.model('users', UserSchema);
        const userUpdated = await userModel.updateOne({ id: id }, user)?.lean()
        return userUpdated
    }
    catch (err) {
        return err;
    }
}
