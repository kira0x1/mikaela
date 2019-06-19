const config = require('./config.json')
const discord = require('discord.js')
const fs = require('fs')

const people = require('./people.js')
const users = require('./people.json').users

const client = new discord.Client()
const prefix = require('./config.json').prefix

client.commands = new discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    client.user.setActivity('Poker with Lelouch', {
        type: "PLAYING"
    })
    console.log('Mikaela online')
});

client.on('message', async message => {
    if (message.channel.type == "dm") {
        if (message.author.bot) return

        console.log('message is in dm channel')
        console.log('message: ' + message)

        message.client.fetchUser(users['kira']).then(user => {
            const messageEmbed = new discord.RichEmbed()
                .setColor('#0099ff')
                .setAuthor(message.author.username, message.author.avatarURL)
                .addBlankField()
                .addField('Message', message.content, true)
                .addBlankField()
                .setTimestamp();

            user.send(messageEmbed)


        }).catch(error => {
            console.error(error)
        })

        return
    }

    //Check if mikaela was mentioned 
    if (message.mentions.members.size > 0) {
        if (message.mentions.members.first().id === '585874337618460672' && !message.author.bot) {
            try {
                const args = message.content.slice(prefix.length).split(/ +/);
                const command = args.shift().toLowerCase();

                client.commands.get('').execute(message, args)

                return
            } catch (error) {

            }
        }
    }

    //If mikaela was not mentioned, and does not start with the prefix, and or the message was from a bot, return
    if (!message.content.startsWith(prefix) || message.author.bot)
        return

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();


    switch (commandName) {
        case 'com':
            people.execute(message, 'commiboy')
            return
        case 'ren':
            people.execute(message, 'renknock')
            return
        case 'am':
            people.execute(message, 'amelie')
            return
        case 'guy':
            people.execute(message, 'guy')
            return
        case '123':
            people.execute(message, 'numbers')
            return
        case 'austin':
            people.execute(message, 'austin')
            return
        case 'san':
            people.execute(message, 'san')
            return
        case 'jer':
            people.execute(message, 'jeremy')
            return
        case 'goan':
            people.execute(message, 'goan')
            return
        case 'cats':
            people.execute(message, 'cats')
            return
        case 'dodger':
            people.execute(message, 'dodger')
            return
    }

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
        try {
            args.push(command)
            client.commands.get('').execute(message, args)
        } catch (error) {
            console.log(error)
        }
        return;
    }


    try {
        command.execute(message, args)
    } catch (error) {
        console.log(error)
    }

})



client.login(config.token)