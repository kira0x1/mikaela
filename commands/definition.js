const http = require('https')
const unirest = require('unirest')
const { Message, RichEmbed } = require('discord.js')
const chalk = require('chalk')
const ct = require('common-tags')
const dir = console.dir
const log = console.log
const { quickEmbed } = require('../util/embedUtil')

// const { id: app_id, key: app_key } = require('./oxford')
const app_key = '3f819411b99d63544bc61c9e6d10fd0b'
const app_id = 'ae8ba8e6'

const wordId = "ace";
const fields = "pronunciations";
const strictMatch = "false";

const options = {
    host: 'od-api.oxforddictionaries.com',
    port: '443',
    path: '/api/v2/entries/en-gb/' + wordId + '?fields=' + fields + '&strictMatch=' + strictMatch,
    method: "GET",
    headers: {
        'app_id': app_id,
        'app_key': app_key,
    }
};


module.exports = {
    name: 'definition',
    description: 'Displays the definition of a word.',
    aliases: ['define', 'df'],
    cooldown: 3,
    usage: ' \`[word]\`',
    guildOnly: true,
    args: true,

    /**
     *
     *
     * @param {Discord.Message} message
     * @param {Array} args
     */

    async execute(message, args) {
        unirest.post('')
            .headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
            .send({ "parameter": 23, "foo": "bar" })
            .end(function (response) {
                console.log(response.body);
            });
    }
}