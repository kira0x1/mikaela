import 'dotenv/config';

const production_prefix = process.env.PROD_PREFIX;
const development_prefix = process.env.DEV_PREFIX;

const dev_token = process.env.DEV_TOKEN;
const mikaela_token = process.env.PROD_TOKEN;

export const args = require('minimist')(process.argv.slice(2));

// Returns true if --production is an argument
export const isProduction = args['production'];

const cmdPrefix = args['prefix'];

export const prefix = cmdPrefix || isProduction ? production_prefix : development_prefix;

export const token = isProduction ? mikaela_token : dev_token;

export const owner_server_id = process.env.OWNER_SERVER_ID;

const prodDB = process.env.PROD_DB;

export const devDB = process.env.DEV_DB;

export const dbURI = isProduction || args['prodDB'] ? prodDB : devDB;

export const perms = {
   owner: {
      name: 'owner',
      users: [process.env.OWNER_ID],
      rank: '0'
   },
   admin: {
      name: 'admin',
      users: [process.env.OWNER_ID],
      rank: '1'
   }
};

export const mainBotId = process.env.BOT_ID;

export const elasticServer = process.env.ELASTIC_SERVER;
export const elasticUser = process.env.ELASTIC_USERNAME;
export const elasticPass = process.env.ELASTIC_PASSWORD;
