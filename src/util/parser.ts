import { User, Client, Guild, Role } from 'discord.js';

const USER_MENTION_PATTERN = /<@!|>/g;
const ROLE_MENTION_PATTERN = /<@&|>/g;

export async function parseUser(userString: string, client: Client): Promise<User> {
    if (!userString) {
        return null;
    }

    let user = userString.replace(USER_MENTION_PATTERN, '');
    return await client.users.fetch(user);
}

export async function parseRole(roleStr: string, guild: Guild): Promise<Role> {
    if (!roleStr) {
        return null;
    }

    let parsedStr: string = roleStr.replace(ROLE_MENTION_PATTERN, '');

    return await guild.roles.fetch(parsedStr);
}
