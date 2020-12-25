import chalk from 'chalk';
import { connect, connection, ConnectOptions } from 'mongoose';
import { dbURI } from '../config';
import { CacheBlockedList } from './dbBlocked';

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

db.on('error', console.error.bind(console, 'Connection Error:'));
db.once('open', () => {
   console.log(chalk.bgGreen.bold('Connected to MongoDB'));
   CacheBlockedList();
});
