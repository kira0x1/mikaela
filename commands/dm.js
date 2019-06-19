const people = require('../people.json')
const users = people.users
const perms = people.perms

module.exports = {
    "name": 'dm',
    "description": "dm's users",

    async execute(message, args) {

        let userArgs = args.shift()
        let person = users[userArgs.toLowerCase()]
        let canDM = false

        if (person === undefined) {
            //Change person to id
            //check if they have permission

            for (let i = 0; i < perms.length; i++) {
                if (message.author.id === users[perms.id[i]]) {
                    person = userArgs
                    console.log(`[${perms[i]}] has permission to use id dms`)
                    canDM = true
                    break
                }
            }

            if (!canDM) {
                message.reply('You do not have permission to dm people by id')
                console.log(`${message.author.username} does not have permission to use id dms`)
                return
            }
        }

        message.client.fetchUser(person).then(user => {
            sendMessage(user, args)
        }).catch(error => {
            console.error(error)
        })


        async function sendMessage(user, args) {
            let msg = args.join(' ')
            user.send(msg)
        }
    }

}