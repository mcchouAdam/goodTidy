require('dotenv').config();

const { MONGO_DB, MONGO_DB_PASSWORD } = process.env;

const { MongoClient } = require('mongodb');

const url = `mongodb+srv://stylish_cowork:${MONGO_DB_PASSWORD}@cluster0.tnmt8js.mongodb.net/?retryWrites=true&w=majority`;
const Mongo = new MongoClient(url);
const MongeDatabase = Mongo.db(MONGO_DB);
Mongo.connect();

// MongoDB Collection
const noteVersionCollection = Mongo.db(MONGO_DB).collection('note_version');
const noteCollection = Mongo.db(MONGO_DB).collection('notes');
const commentCollection = Mongo.db(MONGO_DB).collection('comments');
const annotationCollection = Mongo.db(MONGO_DB).collection('annotation');
const messageCollection = Mongo.db(MONGO_DB).collection('message');
const userCollection = Mongo.db(MONGO_DB).collection('user');

module.exports = {
  Mongo,
  MongeDatabase,
  noteVersionCollection,
  noteCollection,
  commentCollection,
  annotationCollection,
  messageCollection,
  userCollection,
};
