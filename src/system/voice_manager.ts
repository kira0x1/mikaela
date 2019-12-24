import { Client, VoiceChannel, GuildMember, VoiceReceiver } from 'discord.js';
import { coders_club_id } from '../config';

export async function initVoiceManager(client: Client) {

    const coders_club = client.guilds.get(coders_club_id)
    if (!coders_club) return


    const voice_role = coders_club.roles.get("642540366935097365")
    if (!voice_role) return

    coders_club.members.map(m => {
        if (m.roles.has(voice_role.id)) {
            m.removeRole(voice_role)
        }
    })

    coders_club.channels.map(channel => {
        if (((channel): channel is VoiceChannel => channel.type === "voice")(channel)) {
            channel.members.map(member => {
                member.addRole(voice_role)
            })
        }
    })


    client.on("voiceStateUpdate", (oldMember, newMember) => {
        const member = oldMember || newMember

        if (member.guild.id !== coders_club_id) {
            return;
        }

        const oldChannel = oldMember.voiceChannel
        const newChannel = newMember.voiceChannel


        if (!oldChannel && newChannel) {
            //User joined a vc
            newMember.addRole(voice_role)
        } else if (!newChannel) {
            //User left vc
            newMember.removeRole(voice_role)
        }
    })
}