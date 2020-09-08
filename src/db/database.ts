import { Connection, createConnection, connection, connect } from 'mongoose';

import { dbURI } from '../config';

export var conn: Connection;

export async function dbInit() {
    conn = await createConnection(dbURI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        keepAlive: true,
    });

    console.log('Connected to mongodb');
}
