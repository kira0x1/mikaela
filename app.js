const fs = require('fs')
const Discord = require('discord.js')
const config = require('./config.json')
const { prefix, token } = config

const client = new Discord.Client()


//get commands
client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
}

//Command Cooldown
const cooldowns = new Discord.Collection()



client.once('ready', () => {
    console.log('ready!')
})

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot)
        return

    const args = message.content.slice(prefix.length).split(/ +/)
    const commandName = args.shift().toLowerCase()

    //Get command
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    if (!command) {
        message.reply('Could not find command: ' + commandName)
        return;
    }


    //Check if command needs arguments
    if (command.args && !args.length) {
        let reply = `Arguments missing for command: ${command.name}`

        if (command.usage) {
            reply += `\nUsage: \`${prefix}${command.name} ${command.usage}\``
        }

        return message.reply(reply)
    }

    //Check if guild only
    if (command.guildOnly && message.channel.type !== 'text') {
        message.reply('That command cannot be used inside of dm\'s')
        return
    }

    //Check if admin only
    if (command.adminOnly) {
        message.reply('This command is admin only')
        return
    }

    //Cooldowns
    if (!cooldowns.has(command.name)) {

        //Check if cooldowns has the commend, if not then add it in
        cooldowns.set(command.name, new Discord.Collection())
    }

    const now = Date.now()
    const timestamps = cooldowns.get(command.name)

    //get cooldown amount, if none set it to 3 seconds by default
    const cooldownAmount = (command.cooldown || 3) * 1000

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000
            return message.reply(`Command on cooldown. Cooldown: ${timeLeft.toFixed(1)} second(s)`)
        }
    }
    else {
        timestamps.set(message.author.id, now)
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)
    }


    //Try to execute command
    try {
        command.execute(message, args)
    }
    catch (error) {
        console.error(error)
        message.reply('error trying to call command')
    }
})



//bot login
client.login(token)