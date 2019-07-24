const { Commands, UserCommands } = require('../database/dbObjects')

async function InsertUserCommand(userTag, commandName, args, guildName) {
    UserCommands.create({ user_name: userTag, command_name: commandName, command_args: args, guild_name: guildName })
}

async function FindAll(table, includes) {
    //todo
}

module.exports = { InsertUserCommand }