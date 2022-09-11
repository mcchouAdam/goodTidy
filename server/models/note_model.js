const { Mongo } = require('./mongocon');
require('dotenv').config();
const { MONGO_DB, SERVER_HOST } = process.env;
const ObjectId = require('mongodb').ObjectId;

const writeNote = async (note) => {
  // transaction ------------------------------------------
  // Step 1: Start a Client Session
  // await Mongo.connect();
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
    // await Mongo.close();
  }
};

const createNoteVersion = async (version_info) => {
  // await Mongo.connect();
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
    // await Mongo.close();
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

const getUserNotes = async (user_id) => {
  // await Mongo.connect();
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

    // console.log(result);

    return result;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

const shareToAll = async (data) => {
  // await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');

  const note_id = data.note_id;
  const isSharing = +data.isSharing;
  const url_permission = +data.url_permission;
  const sharing_descrition = data.sharing_descrition;
  const sharing_image = data.file_name;
  const sharing_url = data.sharing_url;

  try {
    const result = await NotesCollection.updateOne(
      {
        '_id': ObjectId(note_id),
      },
      {
        $set: {
          'isSharing': isSharing,
          'url_permission': url_permission,
          'sharing_url': sharing_url,
          'sharing_descrition': sharing_descrition,
          'sharing_image': sharing_image,
        },
      }
    );
    console.log(result);
    return result;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

const shareToOther = async (data) => {
  // await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  const UserCollection = Mongo.db(MONGO_DB).collection('user');

  // console.log(data);
  const note_id = data.note_id;
  const permission = data.permission;
  const user_email = data.addPerson;
  const insert_data = { 'user_email': user_email, 'permission': permission };

  try {
    const checkUserExist = await UserCollection.find({
      'email': user_email,
    }).toArray();

    if (checkUserExist.length === 0) {
      return '此使用者不存在';
    }

    const result = await NotesCollection.updateOne(
      {
        '_id': ObjectId(note_id),
      },
      {
        $addToSet: { 'sharing_user': insert_data },
      }
    );
    // console.log(result);
    return `${user_email} 新增成功`;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// TODO: 看可不可以一次查完
const getShareToOther = async (note_id) => {
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  const UserCollection = Mongo.db(MONGO_DB).collection('user');

  try {
    const result = await NotesCollection.find({
      '_id': ObjectId(note_id),
    })
      .project({ sharing_user: 1 })
      .toArray();

    // console.log('getShareToOther: ', result);
    const shareUser_info = result[0].sharing_user;
    let shareUser_emails = [];
    let shareUser_permission = [];
    shareUser_info.map((s) => {
      shareUser_emails.push(s.user_email);
      shareUser_permission.push(s.permission);
    });

    // console.log(shareUser_emails);
    // const UserCollection = Mongo.db(MONGO_DB).collection('user');
    const shareUser_access_token = await UserCollection.find({
      email: { $in: shareUser_emails },
    })
      .project({ 'access_token': 1 })
      .toArray();

    let result_json = [];
    for (let i = 0; i < shareUser_emails.length; i++) {
      let data = {
        'user_email': shareUser_emails[i],
        'permission': shareUser_permission[i],
        'access_token': shareUser_access_token[i].access_token,
      };
      result_json.push(data);
    }
    console.log(result_json);
    // console.log(result);

    return result_json;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

const getShareNotes = async (paging) => {
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');

  try {
    const skip = (paging - 1) * 6;
    const limit = 6;

    const result = await NotesCollection.aggregate([
      {
        '$match': { 'isSharing': 1 },
      },
      { '$addFields': { 'foreign_user_id': { '$toObjectId': '$user_id' } } },
      { '$addFields': { 'foreign_note_id': { '$toString': '$_id' } } },
      {
        $lookup: {
          from: 'user',
          localField: 'foreign_user_id',
          foreignField: '_id',
          as: 'user_info',
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: 'foreign_note_id',
          foreignField: 'note_id',
          as: 'comments_info',
        },
      },
    ])
      .sort({ 'created_time': -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    console.log(result);

    return result;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

const getNoteById = async (note_id) => {
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  try {
    const result = await NotesCollection.aggregate([
      {
        '$match': {
          '_id': ObjectId(note_id),
        },
      },
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
    // console.log(result);
    return result;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

const createComment = async (data) => {
  const CommentsCollection = Mongo.db(MONGO_DB).collection('comments');
  try {
    const result = await CommentsCollection.insertOne(data).toArray();
    const comment_id = result.insertedId.toString();

    return comment_id;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

const getNoteAuth = async (user_email, note_id) => {
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');

  try {
    const result = await NotesCollection.aggregate([
      {
        '$match': {
          '_id': ObjectId(note_id),
        },
      },
      { $unwind: '$sharing_user' },
      {
        '$match': {
          'sharing_user.user_email': user_email,
        },
      },
    ])
      .project({ 'sharing_user.permission': 1 })
      .toArray();

    let permission;
    if (result.length === 0) {
      permission = 0;
    } else {
      permission = result[0].sharing_user.permission;
    }

    return permission;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

const getComments = async (note_id) => {
  const CommentsCollection = Mongo.db(MONGO_DB).collection('comments');
  try {
    const result = await CommentsCollection.aggregate([
      {
        '$match': { 'note_id': note_id },
      },
    ]).toArray();
    // const comment_id = result.insertedId.toString();
    console.log(result);
    return result;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

module.exports = {
  writeNote,
  createNoteVersion,
  getUserNotes,
  shareToAll,
  shareToOther,
  getShareToOther,
  getShareNotes,
  getNoteById,
  createComment,
  getNoteAuth,
  getComments,
};
