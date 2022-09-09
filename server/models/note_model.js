const { Mongo } = require('./mongocon');
require('dotenv').config();
const { MONGO_DB } = process.env;
const ObjectId = require('mongodb').ObjectId;

const writeNote = async (note) => {
  // transaction ------------------------------------------
  // Step 1: Start a Client Session
  await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  const NoteVerCollection = Mongo.db(MONGO_DB).collection('note_version');
  const session = Mongo.startSession();
  try {
    console.log('上傳筆記 writeNote');

    // Step 2: Optional. Define options to use for the transaction
    const transactionOptions = {
      readPreference: 'primary',
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' },
    };

    // Step 3: Use withTransaction to start a transaction, execute the callback, and commit (or abort on error)
    // Note: The callback for withTransaction MUST be async and/or return a Promise.
    await session.withTransaction(async () => {
      const note_obj = {
        'user_id': note.user_id,
        'note_name': note.note_name,
        'file_name': note.file_name,
        'note_classification': note.note_classification,
        'created_time': note.timestamp,
        'lastEdit_time': note.timestamp,
        'lastVersion': note.version_name,
      };

      const note_result = await NotesCollection.insertOne(note_obj);
      const note_id = note_result.insertedId.toString();

      const version_obj = {
        'note_id': note_id,
        'created_time': note.timestamp,
        // 'file_name': note.file_name,   // 目前不改使用者上傳圖片
        'version_img': note.version_img, // TODO: 目前version_img 為 null
        'version_name': note.version_name,
        'elements': note.elements,
        'keywords': note.keywords,
      };

      const version_result = await NoteVerCollection.insertOne(version_obj);
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

const createNoteVersion = async (version_info) => {
  await Mongo.connect();
  const versionCollection = Mongo.db(MONGO_DB).collection('note_version');
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  try {
    // add new version_info to the collection [note_version]
    await versionCollection.insertOne(version_info);
    const note_id = version_info.note_id;
    const version_name = version_info.version_name;

    // change the attribute lastVersion in collection [note]
    await NotesCollection.findOneAndUpdate(
      { '_id': ObjectId(note_id) },
      { $set: { 'lastVersion': version_name } }
    );
    return res.status(200).send('update note version successfully!');
  } catch (error) {
    return { error };
  } finally {
    await Mongo.close();
  }
};

// const getNoteVersion = async (version_info) => {
//   await Mongo.connect();
//   const versionCollection = Mongo.db(MONGO_DB).collection('note_version');
//   const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
//   try {
//     // add new version_info to the collection [note_version]
//     await versionCollection.insertOne(version_info);
//     const note_id = version_info.note_id;
//     const version_name = version_info.version_name;

//     // change the attribute lastVersion in collection [note]
//     await NotesCollection.findOneAndUpdate(
//       { '_id': ObjectId(note_id) },
//       { $set: { 'lastVersion': version_name } }
//     );
//     return res.status(200).send('update note version successfully!');
//   } catch (error) {
//     return { error };
//   } finally {
//     await Mongo.close();
//   }
// };

// TODO: MongoDB改成只取自己要的
const getUserNotes = async (user_id) => {
  await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  try {
    const result = await NotesCollection.aggregate([
      { '$match': { 'user_id': user_id } },
      { '$addFields': { 'note_id': { '$toString': '$_id' } } },
      {
        $lookup: {
          from: 'note_version',
          localField: 'note_id',
          foreignField: 'note_id',
          as: 'version_info',
        },
      },
    ]).toArray();

    console.log(result);

    return result;
  } catch (error) {
    return { error };
  } finally {
    await Mongo.close();
  }
};

module.exports = {
  writeNote,
  createNoteVersion,
  getUserNotes,
};
