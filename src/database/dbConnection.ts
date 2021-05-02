import chalk from 'chalk';
import { connect, connection, ConnectOptions } from 'mongoose';

import { logger } from '../app';
import { dbURI } from '../config';
import { CacheBlockedList } from './models/Blocked';

const mongooseOptions: ConnectOptions = {
   useNewUrlParser: true,
   useFindAndModify: false,
   useUnifiedTopology: true,
   useCreateIndex: true
};

export async function connectToDB() {
   connect(dbURI, mongooseOptions);
}

export const db = connection;

db.on('error', err => logger.error(err));

db.on('open', () => {
   logger.info(chalk.bgGreen.bold('Connected to MongoDB'));
   CacheBlockedList();
});
