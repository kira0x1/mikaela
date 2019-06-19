module.exports = {
    name: 'leavevc',
    aliases: ['lvc'],

    async execute(message, args) {
        message.member.voiceChannel.leave(connection => {
        })
    }
}