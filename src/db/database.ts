import { connect, Mongoose } from 'mongoose';
import ms from 'ms';

import { dbURI } from '../config';

export let conn: Mongoose

export async function dbInit() {
    conn = await connect(dbURI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        keepAlive: true,
        autoIndex: false,
        maxIdleTimeMS: ms('5m')
    });

    console.log('Connected to mongodb');
}
