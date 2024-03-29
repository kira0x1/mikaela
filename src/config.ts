import 'dotenv/config';

const production_prefix = process.env.PROD_PREFIX;
const development_prefix = process.env.DEV_PREFIX;

const dev_token = process.env.DEV_TOKEN;
const production_token = process.env.PROD_TOKEN;

export const args = require('minimist')(process.argv.slice(2));

// Returns true if --production is an argument
export const isProduction = process.env.NODE_ENV === 'production';

const cmdPrefix = args['prefix'];
export const joinTestVc = args['testvc'];

/**
 * Default prefix when the server have not set a custom prefix
 */
export const prefix = cmdPrefix || isProduction ? production_prefix : development_prefix;

export const token = isProduction ? production_token : dev_token;

/**
 *  The mongodb uri to use in production
 */
const prodDB = process.env.PROD_DB;

/**
 * The mongodb uri to use in development
 */
const devDB = process.env.DEV_DB;

/**
 * MongoDB URI
 */
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

export const elasticServer = process.env.ELASTIC_SERVER;
export const elasticUser = process.env.ELASTIC_USERNAME;
export const elasticPass = process.env.ELASTIC_PASSWORD;

export const testVc = process.env.TEST_VC;
