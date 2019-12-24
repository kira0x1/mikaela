"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const spotify_web_api_node_1 = __importDefault(require("spotify-web-api-node"));
const Style_1 = require("../util/Style");
const api = new spotify_web_api_node_1.default({
    clientId: config_1.spotifyClientId,
    clientSecret: config_1.spotifyKey
});
api.setAccessToken(config_1.spotifyAuthCode);
const subcmd = [
    {
        name: 'search',
        args: true,
        description: 'Searches for tracks using the spotifyAPI',
        aliases: ['sr'],
        execute(message, args) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!args || args.length == 0)
                    return Style_1.QuickEmbed(message, `no arguments given`);
                const query = args.join('');
                Style_1.QuickEmbed(message, `Searching for ${query}...`);
                console.log(`test`);
                api.authorizationCodeGrant(config_1.spotifyAuthCode).then(data => {
                    const accToken = data.body['access_token'];
                    api.setAccessToken(data.body['access_token']);
                    console.log(`settings access token: ${accToken}`);
                    api.searchTracks(query).then(data => {
                        Style_1.QuickEmbed(message, `Found ${data.body.tracks.total} results`);
                        const firstPage = data.body.tracks.items;
                        const fields = [];
                        firstPage.forEach(function (track, index) {
                            const fld = Style_1.createField(track.name, track.uri, true);
                            fields.push(fld);
                        });
                        Style_1.ListEmbed(message, "Songs Found", "spotify search", fields);
                    }).catch(err => {
                        Style_1.QuickEmbed(message, `Error: ${err.message}`);
                    });
                });
            });
        }
    }
];
function authSpotify() {
    return new Promise((resolve, reject) => {
        api.authorizationCodeGrant(config_1.spotifyAuthCode)
            .then(data => {
            api.setAccessToken(data.body['access_token']);
            return resolve();
        }).catch(err => {
            return reject(err);
        });
    });
}
exports.command = {
    name: 'spotify',
    description: 'Spotify Commands',
    // subCmd: subcmd,
    execute(message, args) {
    }
};
