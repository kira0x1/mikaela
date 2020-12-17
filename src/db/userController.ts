import { conn } from './database';
import { IUser, userModel, UserSchema } from './dbUser';

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
    try {
        return await new userModel({
            username: user.username,
            id: user.id,
            tag: user.tag,
            roles: user.roles,
            favorites: user.favorites,
            sourcesGroups: user.sourcesGroups
        }).save()
    }
    catch (err) {
        return err
    }
}

export async function updateUser(id: string, user: IUser) {
    try {
        var userModel = conn.model('users', UserSchema);
        const userUpdated = await userModel.updateOne({ id: id }, user)?.lean()
        return userUpdated
    }
    catch (err) {
        return err;
    }
}
