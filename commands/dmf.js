const people = require('../people.json')
const users = people.users
const perms = people.perms
const discord = require('discord.js')
const folder = '../../pictures/nani/'
const fs = require('fs')

module.exports = {
    "name": 'dmf',
    "description": "dm's files to users",

    async execute(message, args) {

        let userArgs = args.shift()
        let person = users[userArgs]
        let canDM = false
        let file = args + ''

        for (let i = 0; i < perms.files.length; i++) {
            if (message.author.id === users[perms.files[i]]) {
                canDM = true
                break
            }
        }

        if (!canDM) {
            message.reply('You do not have permission to dm people files')
            console.log(`${message.author.username} does not have permission to use id dms`)
            return
        }

        if (userArgs === 'files') {

            let filesEmbed = new discord.RichEmbed()
            filesEmbed.setColor('#d32c5b')

            let fileNumber = 0
            fs.readdir(folder, (err, files) => {
                files.forEach(fileData => {
                    fileNumber++
                    filesEmbed.addField(`${fileNumber}`, `${fileData}`, true)
                    console.log(folder + fileData)
                })

                message.channel.send(filesEmbed)
            })

            return

        } else if (person === undefined) {
            //Change person to id
            //check if they have permission
            person = userArgs
        }

        message.client.fetchUser(person).then(user => {
            sendMessage(user, args)
        }).catch(error => {
            console.error(error)
        })


        async function sendMessage(user, args) {

            let fileNumber = 0;

            fs.readdir(folder, (err, files) => {
                files.forEach(fileData => {
                    fileNumber++

                    console.log('filenumber: ' + fileNumber + ' file: ' + file)

                    if (fileNumber == file) {

                        let msgInfo = `***File sent***\nFrom:**${message.author.username}**\nSent file: **${fileData}**\nTo user: **${user.username}**`

                        message.channel.send(msgInfo, {
                            files: [folder + fileData]
                        })

                        user.send(msgInfo, {
                            files: [folder + fileData]
                        }).catch(error => {
                            console.error(error)
                        })
                    }
                })
            })
        }
    }

}