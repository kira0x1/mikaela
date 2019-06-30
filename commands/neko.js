const agent = require('superagent')

class nekoFunc {
    constructor(name, description, aliases, usage, args, guildOnly) {
        this.name = name;
        this.description = description;
        this.aliases = aliases;
        this.usage = usage;
        this.args = args;
        this.guildOnly = guildOnly;
    }

    getName() { return this.name }
    getDesc() { return this.description; }
    getAliases() { return this.aliases; }
    getUsage() { return this.usage }
    getArgs() { return this.args }
    getGuldOnly() { return this.guildOnly }

    callAPI(message, args) { }

    static neko(type, params, message) {
        let url = 'https://nekobot.xyz/api/imagegen?type=' + type

        agent.get(url)
            .query(params)
            .then(response => {
                message.channel.send({ file: response.body.message })
            })
            .catch(error => {
                console.log(error);
            })
    }
}


const nekoCommands = [
    win = new nekoFunc('win', 'Who would win!?', ['who'], '<user1> <user2>', true, true),
    trump = new nekoFunc('trump', 'Trump tweet ^.^', ['tweet', 'tt'], '<text>', true, true),
    trap = new nekoFunc('trap', 'Trap card someone!', ['tr'], '<user>', true, true),
    trash = new nekoFunc('trash', 'Trash waifu', '<mention-user or image-url>', true, true),
    magik = new nekoFunc('magik', 'Magikfy stuff :<', ['magic', 'm'], '<image> <intensity>', true, true),
    kanna = new nekoFunc('kanna', 'kannafy a message :3', ['kn'], '<text>', true, true),
    kanna = new nekoFunc('lolify', 'lolify someone uwu', ['loli'], '<user>', true, true)
]


const nekoFunctions = [
    trump = function (message, args) {
        const params = { text: args.join(' ') }
        nekoFunc.neko('trumptweet', params, message)
    },
    win = function (message, args) {
        const mentions = message.mentions.users

        if (mentions.size === 2) {
            params = {
                user1: mentions.first().avatarURL,
                user2: mentions.last().avatarURL
            }
            return nekoFunc.neko('whowouldwin', params, message)
        }
        return message.reply(usage(this))
    },
    trap = function (message, args) {
        let isGoboblin = false

        let trap = {
            name: 'xxxIRANbOYxxx',
            author: 'Goboblin',
            image: goboblin
        }
        if (args.join(' ') === 'goboblin') {
            isGoboblin = true
        }
        if (!isGoboblin) {
            //Get user from args
            let victim = message.mentions.users.first()
            if (!victim)
                return message.reply(usage(this))
            trap = {
                name: victim.username, //victim
                author: message.author.username, //Author
                image: victim.avatarURL //Victims Avatar URL
            }
        }
        nekoFunc.neko('trap', trap, message);
    },
    trash = function (message, args) {
        let waifuImage = args[0]
        const user = message.mentions.users.first()
        if (user)
            waifuImage = user.avatarURL
        let query = {
            url: waifuImage
        }
        nekoFunc.neko('trash', query, message);
    },
    magik = function (message, args) {
        let img = args[0]
        let intensity = args[1]
        if (intensity === undefined) {
            intensity = 3
        }
        else if (isNaN(intensity)) {
            return message.reply(usage(this))
        } else if (intensity < 1 || intensity > 10) {
            return message.reply('`Intensity must be between 1 - 10`')
        }

        let user1 = message.mentions.users.first()
        if (user1) {
            img = user1.avatarURL
        }
        let params = { image: img, intensity: intensity }
        nekoFunc.neko('magik', params, message)
    },
    kanna = function (message, args) {
        const query = {
            text: args.join(' ')
        }
        nekoFunc.neko('kannagen', query, message);
    },
    lolify = function (message, args) {
        let img = args[0]
        let user1 = message.mentions.users.first()
        if (user1) {
            img = user1.avatarURL
        }
        let params = { url: img }
        nekoFunc.neko('lolice', params, message)
    }
]

nekoCommands.forEach(cmd => {
    cmd.callAPI = nekoFunctions.find(func => func.name === cmd.name)
});


module.exports = {
    name: 'neko',
    description: 'commands from the nekoFunc.neko api',
    aliases: nekoCommands.map(cmd => cmd.name),
    usage: `usage: ${nekoCommands.map(fnc => '\n'.concat('\n', fnc.name, ': ', fnc.usage))}`,
    guildOnly: true,

    execute(message, args) {
        const input = message.content.slice(1).split(' ')[0]
        console.log(`input: ${input}`)

        nekoCommands.find(cmd => {
            if (cmd.name === input) {
                return cmd.callAPI(message, args);
            }
        })
    }
}