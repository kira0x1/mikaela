const { Users } = require('../../database/dbObjects')
const users = []

module.exports = {
    name: 'user',
    helper: true,

    getUsers() {
        return users
    },

    //NOTE add song to paramaters
    async add(id, username) {
        const user = users.find(usr => usr.user_id === id)
        if (user) return

        const newUser = await Users.create({ user_id: id, user_name: username })
        users.push({ user_id: id, user_name: username })
        return newUser
    },
    async init() {
        const result = await Users.findAll({ attributes: ['user_id', 'user_name'] }, { raw: true })
        result.map((data) => users.push(data.toJSON()))
    }
}