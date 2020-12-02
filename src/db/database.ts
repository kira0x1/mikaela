import { connect, ConnectOptions, Mongoose } from 'mongoose';
import { dbURI } from '../config';


export let conn: Mongoose

const connOptions: ConnectOptions = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    socketTimeoutMS: 65000,
}

export async function dbInit() {
    try {
        conn = await connect(dbURI, connOptions);
        console.log('Connected to mongodb');
    } catch (error) {
        console.error(error)
    }
}
