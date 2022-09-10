require('dotenv').config();
const { MONGO_DB, MONGO_DB_PASSWORD } = process.env;

const MongoClient = require('mongodb').MongoClient;

const url = `mongodb+srv://stylish_cowork:${MONGO_DB_PASSWORD}@cluster0.tnmt8js.mongodb.net/?retryWrites=true&w=majority`;
const Mongo = new MongoClient(url);
const MongeDatabase = Mongo.db(MONGO_DB);
Mongo.connect();

module.exports = { Mongo, MongeDatabase };
