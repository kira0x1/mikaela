import { User, Client } from 'discord.js';

const MENTION_PATTERN = /<@!|>/g;

export async function parseUser(userString: string, client: Client): Promise<User> {
    if (!userString) {
        return null;
    }

    let user = userString.replace(MENTION_PATTERN, '');
    return await client.users.fetch(user);
}
