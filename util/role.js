const { perms, users } = require('../config.json')

module.exports = {
    execute(roles, id) {
        if (roles === undefined)
            return true

        for (let i = 0; i < roles.length; i++) {
            const permUsers = perms[roles[i]]
            const user = permUsers.map(uname => users[uname])

            if (user) {
                if (user.includes(id)) {
                    return true
                }
            }
        }

        return false
    }
}