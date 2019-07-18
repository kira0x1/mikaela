const { getUsers } = require('./users')

module.exports = {
    name: 'list',
    description: 'List\'s your favorite songs',
    aliases: ['l'],
    guildOnly: true,

    execute(message, args) {
        const users = getUsers()
        const userlist = users.map((user, position) =>
            `*${(position + 1)}:* **${user.user_name}**`).join('\n') || 'No users set.'
        return message.channel.send(userlist)
    }
}