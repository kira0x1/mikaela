// Tokens
export const discordToken = 'TOKEN';
export const spotifyToken = {
   clientId: 'X',
   clientSecret: 'X'
};

// Arg Parsing
export const args = require('minimist')(process.argv.slice(2));
export const isProduction = args['production']; // true if --production is an arg

// Prefix
const devPrefix = '$';
const prodPrefix = '.';
const cmdPrefix = args['prefix'];
export const prefix = cmdPrefix || isProduction ? prodPrefix : devPrefix;

// Database
// @ts-ignore
const prodDB = 'MONGODB URL';
export const dbURI = prodDB;

// Perms
export const perms = {
   kira: {
      name: 'kira',
      users: ['177016697117474816'],
      rank: '0'
   },
   admin: {
      name: 'admin',
      users: ['177016697117474816'],
      rank: '1'
   }
};
