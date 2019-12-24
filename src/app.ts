import chalk from 'chalk';
import { Client, Collection, Message, RichEmbed, TextChannel } from 'discord.js';
import { Player } from './classes/Player';
import { initEmoji } from './commands/music/play';
import { coders_club_id, prefix, token } from './config';
import { dbInit } from './db/database';
import { syncRoles } from './system/sync_roles';
import { initVoiceManager } from './system/voice_manager';
import { commandGroups, FindCommand, FindCommandGroup, InitCommands } from './util/commandUtil';
import { embedColor, QuickEmbed, wrap } from './util/style';
import { InitGuilds } from './db/dbGuild';




//FIXME REMEMBER TO CHANGE PREFIX AND DB IN CONFIG BACK TO PRODUCTION SETTINGS
//FIXME REMEMBER TO CHANGE 'TESTING' BACK TO FALL BEFORE UPLOADING

const IS_TESTING = false;


const client = new Client()
const players: Collection<string, Player> = new Collection();

async function init() {
    await dbInit()
    client.login(token);
}

client.on("ready", () => {

    //Save heart emoji to use for favorites
    initEmoji(client)

    //Add event listener to add/remove voice role
    initVoiceManager(client)

    //Add event listeners to #roles
    syncRoles(client)

    //Read command files and set it to a array
    InitCommands();

    //FIXME REMOVE AFTER SETUP
    // InitGuilds(client)

    console.log(chalk.bgCyan.bold(`${client.user.username} online!`))

    //Setup players
    client.guilds.map(guild => {
        console.log(chalk.bgBlue.bold(`${guild.name}`))
        players.set(guild.id, new Player(guild, client))
    })
})

//Called when a member joins a server
client.on("guildMemberAdd", member => {

    //Check if is testing
    if (IS_TESTING) return


    //Check if member is from coders club
    if (member.guild.id !== coders_club_id) return

    //setup content message
    let content = `>>> Welcome **${member.toString()}**`
    content += `\nYou can pick out some roles from **<#618438576119742464>**`

    //get codersclub
    const guild = client.guilds.get(coders_club_id)
    if (!guild) return console.log("guild not found")

    //get welcome channel
    let channel = guild.channels.get("647099246436286494")
    if (!channel) return

    //send welcome message
    if (((channel): channel is TextChannel => channel.type === "text")(channel)) {
        channel.send(content)
    } else {
        console.log("channel problem")
    }
})


//OnMessage
client.on("message", message => {

    //Check if message is from a bot and that the message starts with the prefix
    if (message.author.bot || !message.content.startsWith(prefix)) {
        return;
    }

    //Check if is testing and not in coders club
    if (IS_TESTING && message.guild.id !== coders_club_id) return

    //Split up message into an array and remove the prefix
    let args = message.content.slice(prefix.length).split(/ +/)

    //Remove the first element from the args array ( this is the command name )
    let commandName = args.shift()
    if (!commandName || commandName.includes(prefix) || commandName === prefix) return;

    //Set commandName to lowercase
    commandName = commandName.toLowerCase()

    //Search for the command
    let command = FindCommand(commandName)


    //If the command wasnt found check if its in a commandgroup
    if (!command) {
        const grp = FindCommandGroup(commandName)
        if (grp) {
            commandName = args.shift()
            if (!commandName) return
            command = grp.find(cmd => cmd.name.toLowerCase() === commandName || cmd.aliases && cmd.aliases.find(al => al === commandName))
        }
    }

    //If command not found send a message
    if (!command) return QuickEmbed(message, `command ${wrap(commandName || "")} not found`)

    let canUseCommand = true
    if (message.guild.id === "413059339138629632") {
        if (message.channel.id === "595870992476274688") {
            commandGroups.find((commands, key) => key === "music").map(cmd => {
                if (command && command.name === cmd.name)
                    canUseCommand = false
            })
        }
    }

    if (!canUseCommand) {
        return message.member.send(`You cant use music commands in general`)
    }

    if (command.args && args.length === 0) {
        let usageString = "Arguments required"

        const embed = new RichEmbed()
        embed.setColor(embedColor)

        if (command.usage) {
            usageString = command.name + " "
            usageString += wrap(command.usage, "`")
        }

        embed.addField("Arguments Required", usageString)
        return message.channel.send(embed)
    }

    try {
        command.execute(message, args)
    }
    catch (err) {
        console.error(err)
    }
})

export function getPlayer(message: Message) {
    return players.get(message.guild.id)
}

init()
// client.login(token)