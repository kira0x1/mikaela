import { User, Client } from 'discord.js';

const USER_MENTION_PATTERN = /<@!|>/g;

export async function parseUser(userString: string, client: Client): Promise<User> {
    if (!userString) {
        return null;
    }

    let user = userString.replace(USER_MENTION_PATTERN, '');

    return await client.users.fetch(user).catch(_ => {
        return null;
    });
}
