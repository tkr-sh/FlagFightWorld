import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config()
// require('dotenv').config();
// const uri = "mongodb+srv://tkirishima:Akuser00t!@cluster0.b4kpave.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri);

export async function connectToCluster() {
    let mongoClient;
 
    try {
        mongoClient = new MongoClient(process.env.MONGODB_URI);
        console.log('Connecting to MongoDB Atlas cluster...');
        mongoClient.connect();
        console.log('Successfully connected to MongoDB Atlas!');
 
        return mongoClient;
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
};

export default ObjectId;



export const jsonFind = (doc) => {
    if (doc === null) return null;
    return JSON.parse(JSON.stringify(doc));
};


const client = await connectToCluster();
export const db = client.db("flag_fight");

// const test = new ObjectId("a")