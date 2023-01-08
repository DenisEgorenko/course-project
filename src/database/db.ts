import {MongoClient} from 'mongodb';
import * as dotenv from 'dotenv'
import * as mongoose from "mongoose";

dotenv.config()


const url = process.env.MONGO_URL

console.log('url: ', url)

if (!url) {
    throw new Error('URL does not found')
}
const client = new MongoClient(url)


export const runDb = async () => {
    try {
        await client.connect();

        await mongoose.connect(url)

        if (process.env.NODE_ENV !== 'test') {
            console.log('Connected to database')
        }

    } catch (e) {
        console.log('Does not connected to database')
        await mongoose.disconnect()
    }
}

export const dataBase = client.db()


