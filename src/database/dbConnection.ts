import { connect, connection } from 'mongoose';
import { logger } from '../system';
import { dbURI } from '../config';
import { CacheBlockedList } from './models/Blocked';

export async function connectToDB() {
   connect(dbURI);
}

export const dbConnection = connection;

dbConnection.on('error', err => logger.error(err));

dbConnection.on('open', () => {
   logger.info('Connected to MongoDB');
   CacheBlockedList();
});
