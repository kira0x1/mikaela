const production_prefix = '.';
const development_prefix = '$';

const mikaela_token = 'TOKEN';

export const spotify_tokens = {
   clientId: 'X',
   clientSecret: 'X'
};

export const args = require('minimist')(process.argv.slice(2));

// Returns true if --production is an argument
export const isProduction = args['production'];

const cmdPrefix = args['prefix'];

export const prefix = cmdPrefix || isProduction ? production_prefix : development_prefix;

export const token = mikaela_token;

// @ts-ignore
const prodDB = 'MONGODB URL';

export const dbURI = prodDB;

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
