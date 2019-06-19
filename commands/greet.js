module.exports = {
    name: 'greet',
    description: 'greets user',
    execute(message, args) {
        if (!args.length) {
            message.channel.send('Hii :D')
            return;
        }

        let member = message.mentions.users.first();

        message.channel.send('Hii :D', {
            reply: member,
            embed: {
                color: 0xbd305d,
                author: {
                    name: member.username,
                    icon_url: member.avatarURL
                },

                image: {
                    url: member.avatarURL
                },
                timestamp: new Date()
            }
        })
    },
};