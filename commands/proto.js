//FIXME REMOVE THIS FILE BEFORE UPLOADING
const music = require('./music')
const { getFlags } = require('../util/util')
const search = require('./music/youtube')

const flags = [
  (amount = { name: 'amount', aliases: ['n'] }),
  (duration = { name: 'duration', aliases: ['d'] })
]

module.exports = {
  name: 'proto',
  description: 'prototype class used for testing and development',
  perms: ['admin'],
  usage: ' ',
  flags: flags,
  aliases: ['pr'],

  async execute(message, args) {
    const query = args.join(' ')
    const flags = getFlags(this.flags, args)

    let amount = flags.find(fl => fl.name === 'amount')
    const site = 'https://www.youtube.com/watch?v=j1tDDZB0Pl0'

    if (amount !== undefined) {
      for (let i = 0; i < amount.args; i++) {
        await music.PlaySong(message, site)
      }
    } else {
      const video = await search.Search(query)
    }
  },

}