import chalk from 'chalk';
import { connect, connection } from 'mongoose';

import { logger } from '../app';
import { dbURI } from '../config';
import { CacheBlockedList } from './models/Blocked';

export async function connectToDB() {
   connect(dbURI);
}

export const db = connection;

db.on('error', err => logger.error(err));

db.on('open', () => {
   logger.info(chalk.bgGreen.bold('Connected to MongoDB'));
   CacheBlockedList();
});
