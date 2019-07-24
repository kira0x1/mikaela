const discord = require('discord.js')
const fs = require('fs')
const config = require('../config.json')
const util = require('./util')
let cooldowns = new discord.Collection()
let Client

//False = admins are not effected by cooldowns
const adminCD = false


module.exports = {

    //ANCHOR Get js files from commands folder and add it to the bots commands
    /**
     *
     *
     * @param {discord.Client} client
     */
    initCommands(client) {
        Client = client
        client.commands = new discord.Collection()
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

        for (const file of commandFiles) {
            const command = require(`../commands/${file}`)

            client.commands.set(command.name, command)
        }
    },

    //ANCHOR Check if command is on cooldown
    IsOnCoolDown(command, message) {
        const id = message.author.id
        //Cooldowns
        if (!cooldowns.has(command.name)) {
            //Check if cooldowns has the commend, if not then add it in
            cooldowns.set(command.name, new discord.Collection())
        }

        const now = Date.now()
        const timestamps = cooldowns.get(command.name)

        //get cooldown amount, if none set it to 3 seconds by default
        const cooldownAmount = (command.cooldown || 3) * 1000

        const noCD = id === config.users.kira && !adminCD

        if (timestamps.has(id) && !noCD) {
            const expirationTime = timestamps.get(id) + cooldownAmount

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000
                return message.reply(`Command on cooldown. Cooldown: ${timeLeft.toFixed(1)} second(s)`)
            }
        } else if (!noCD) {
            timestamps.set(id, now)
            setTimeout(() => timestamps.delete(id), cooldownAmount)
        }
    },

    //ANCHOR Find Command from by name
    findCommand(name) {
        return Client.commands.get(name) || Client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(name))
    },

    checkCommandPerms(command, id) {
        const perms = command.perms
        return util.perms(perms, id)
    },

    findSubCommand(name) {
        const commands = Client.commands.array()
        for (let i = 0; i < commands.length; i++) {
            let cmd = commands[i]

            if (!cmd.subcommands) continue

            let subCmd = cmd.subcommands.find(c => c.name === name) || cmd.subcommands.find(c => c.command.aliases && c.command.aliases.includes(name))

            if (subCmd)
                return subCmd.command
        }
    }
}