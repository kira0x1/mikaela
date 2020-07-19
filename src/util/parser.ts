import { User } from 'discord.js';

import { client } from '../app';

const MENTION_PATTERN = /<@!|>/g;

export async function parseUser(userString: string): Promise<User> {
    if (!userString) {
        return null;
    }

    let user = userString.replace(MENTION_PATTERN, "");
    return await client.users.fetch(user);
}
