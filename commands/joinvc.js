module.exports = {
    name: 'joinvc',
    aliases: ['vc', 'jvc'],

    async execute(message, args) {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join().then(connection => {
                console.log('Joined vc');
            }).catch(error => {
                console.log(error);
            })
        }
    }
}