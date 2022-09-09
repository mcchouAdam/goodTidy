const { Mongo } = require('./mongocon');
require('dotenv').config();
const { MONGO_DB } = process.env;
const ObjectId = require('mongodb').ObjectId;

const writeNote = async (note) => {
  // transaction ------------------------------------------
  // Step 1: Start a Client Session
  await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  const session = Mongo.startSession();
  try {
    console.log('上傳筆記 writeNote');
    // console.log('note:', note);
    // const result = await NotesCollection.insertOne(note);

    // Step 2: Optional. Define options to use for the transaction
    const transactionOptions = {
      readPreference: 'primary',
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' },
    };

    // Step 3: Use withTransaction to start a transaction, execute the callback, and commit (or abort on error)
    // Note: The callback for withTransaction MUST be async and/or return a Promise.
    await session.withTransaction(async () => {
      const result = await NotesCollection.insertOne(note);
    }, transactionOptions);

    //  ------------------------------------------

    return result;
  } catch (error) {
    return { error };
  } finally {
    await session.endSession();
    await Mongo.close();
  }
};

const readNote = async (user_id, note_id) => {
  await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  try {
    // console.log('id');
    const id = new ObjectId(note_id);
    const result = await NotesCollection.find({
      '_id': id,
      'user_id': user_id,
    }).toArray();

    return result;
  } catch (error) {
    return { error };
  } finally {
    await Mongo.close();
  }
};

// TODO: 改成只取自己要的
const getUserNotes = async (user_id) => {
  await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  try {
    const result = await NotesCollection.find({
      'user_id': user_id,
    }).toArray();
    
    return result;
  } catch (error) {
    return { error };
  } finally {
    await Mongo.close();
  }
};

module.exports = {
  writeNote,
  readNote,
  getUserNotes,
};
