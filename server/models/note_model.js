const { Mongo } = require('./mongocon');
require('dotenv').config();
const { MONGO_DB, SERVER_HOST } = process.env;
const ObjectId = require('mongodb').ObjectId;
const authorizationList = {
  'forbidden': 0,
  'read': 1,
  'comment': 2,
  'update': 4,
  'delete': 8,
  'admin': 16,
};

// [筆記頁面] 上傳筆記
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
        'created_time': new Date(),
        'lastVersion': note.version_name,
        'comment_count': 0,
        'saved_count': 0,
        'saved_user_id': [],
        'tags': [],
        'annotation_user_id': [],
      };

      const note_result = await NotesCollection.insertOne(note_obj);
      const note_id = note_result.insertedId.toString();

      console.log('note_result', note_result);

      const version_obj = {
        'note_id': note_id,
        'created_time': new Date(),
        // 'file_name': note.file_name,   // 目前不改使用者上傳圖片
        'version_img': note.version_img, // TODO: 目前version_img 為 null
        'version_name': note.version_name,
        'elements': note.elements,
        'keywords': note.keywords,
        'text_elements': JSON.parse(note.text_elements),
      };

      const version_result = await NoteVerCollection.insertOne(version_obj);

      //TODO: 目前
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

// 創立筆記版本
const createNoteVersion = async (version_info) => {
  // await Mongo.connect();
  const versionCollection = Mongo.db(MONGO_DB).collection('note_version');
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  try {
    // add new version_info to the collection [note_version]
    version_info.text_elements = JSON.parse(version_info.text_elements);
    version_info.created_time = new Date();
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

const getUserNotes = async (user_id, note_permission) => {
  // await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  try {
    let note_ids = [];
    let permissions = [];
    let ids = [];
    note_permission.map((n) => {
      note_ids.push(ObjectId(Object.keys(n)[0]));
      ids.push(Object.keys(n)[0]);
      permissions.push(Object.values(n)[0]);
    });

    // console.log('ids', ids);
    // console.log('permissions', permissions);

    const result = await NotesCollection.aggregate([
      { '$match': { '_id': { $in: note_ids } } },
      { '$addFields': { 'note_id': { '$toString': '$_id' } } },
      { '$addFields': { 'user_id': { '$toObjectId': '$user_id' } } },
      {
        $lookup: {
          from: 'note_version',
          localField: 'note_id',
          foreignField: 'note_id',
          as: 'version_info',
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user_info',
        },
      },
    ]).toArray();

    for (let i = 0; i < result.length; i++) {
      // const id = ids[i];
      const index = ids.indexOf(result[i]['note_id']);
      result[i]['user_permission'] = permissions[index];
    }

    return result;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 刪除筆記
const deleteNote = async (note_id) => {
  // await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  const NoteVerCollection = Mongo.db(MONGO_DB).collection('note_version');
  const CommentsCollection = Mongo.db(MONGO_DB).collection('comments');
  try {
    await NotesCollection.deleteOne({
      '_id': ObjectId(note_id),
    });
    await NoteVerCollection.deleteOne({
      'note_id': note_id,
    });
    await CommentsCollection.deleteOne({
      'note_id': note_id,
    });
    return 'delete successfully';
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 改名筆記
const renameNote = async (note_id, new_noteName) => {
  // await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  try {
    const a = await NotesCollection.updateOne(
      {
        '_id': ObjectId(note_id),
      },
      { $set: { 'note_name': new_noteName } }
    );
    return 'rename successfully';
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 搬移筆記
const moveNote = async (note_id, MoveToClass) => {
  // await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  try {
    const result = await NotesCollection.updateOne(
      {
        '_id': ObjectId(note_id),
      },
      { $set: { 'note_classification': MoveToClass } }
    );
    return 'move note_classification successfully';
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 改名分類
const renameNoteClass = async (
  user_id,
  old_classificationName,
  new_classificationName
) => {
  // await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  try {
    const a = await NotesCollection.updateMany(
      {
        'note_classification': old_classificationName,
        'user_id': user_id,
      },
      { $set: { 'note_classification': new_classificationName } }
    );
    return 'rename successfully';
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 刪除分類
const deleteNoteClass = async (user_id, old_classificationName) => {
  // await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  const NoteVerCollection = Mongo.db(MONGO_DB).collection('note_version');
  const CommentsCollection = Mongo.db(MONGO_DB).collection('comments');
  try {
    const note_id = await NotesCollection.aggregate([
      {
        '$match': {
          'user_id': user_id,
          'note_classification': old_classificationName,
        },
      },
      { '$addFields': { 'note_id_toString': { '$toString': '$_id' } } },
    ])
      .project({ 'note_id_toString': 1 })
      .toArray();

    const note_id_objectId = note_id.map((n) => n._id);
    const note_id_toString = note_id.map((n) => n.note_id_toString);

    // console.log('note_id_toString', note_id_toString);
    await NotesCollection.deleteMany({
      '_id': { $in: note_id_objectId },
    });
    await NoteVerCollection.deleteMany({
      'note_id': { $in: note_id_toString },
    });
    await CommentsCollection.deleteMany({
      'note_id': { $in: note_id_toString },
    });
    return 'delete note_class successfully';
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 分享給全部人
const shareToAll = async (data) => {
  // await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');

  const note_id = data.note_id;
  const isSharing = +data.isSharing;
  const url_permission = authorizationList[data.url_permission];
  const sharing_descrition = data.sharing_descrition;
  const sharing_image = data.file_name;
  const sharing_url = data.sharing_url;
  const tags = JSON.parse(data.tags);
  const sharing_time = new Date();

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
          'tags': tags,
          'sharing_time': sharing_time,
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

// 分享給特定的人
const shareToOther = async (data) => {
  // await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  const UserCollection = Mongo.db(MONGO_DB).collection('user');
  const MessageCollection = Mongo.db(MONGO_DB).collection('message');

  // console.log(data);
  const note_id = data.note_id;
  let permission = data.permission;
  permission = authorizationList[permission];
  const user_email = data.addPerson;
  const shareUser_email = data.shareUser_email;
  const insert_data = { 'user_email': user_email, 'permission': permission };

  try {
    // 確認user存在
    const checkUserExist = await UserCollection.find({
      'email': user_email,
    }).toArray();

    if (checkUserExist.length === 0) {
      return '此使用者不存在';
    }

    // 更新note資料
    const result = await NotesCollection.updateOne(
      {
        '_id': ObjectId(note_id),
      },
      {
        $addToSet: { 'sharing_user': insert_data },
      }
    );

    // 更新使用者通知資料
    const msg_result = await MessageCollection.insertOne({
      'notify_user_email': user_email,
      'type': 'share',
      'content': `${shareUser_email}分享一篇筆記給您`,
      'created_time': new Date(),
    });

    return `${user_email} 新增成功`;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 拿取 特定人 權限
const getShareToOther = async (note_id) => {
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');

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

    let result_json = [];
    for (let i = 0; i < shareUser_emails.length; i++) {
      let data = {
        'user_email': shareUser_emails[i],
        'permission': shareUser_permission[i],
      };
      result_json.push(data);
    }
    console.log(result_json);

    return result_json;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 刪除對特定人分享
const deleteShareToOther = async (note_id, delete_email) => {
  // await Mongo.connect();
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');

  try {
    await NotesCollection.updateOne(
      { '_id': ObjectId(note_id) },
      { $pull: { sharing_user: { user_email: delete_email } } },
      false,
      true
    ).toArray();
    return `${delete_email} 刪除成功`;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 拿取 社群頁面 筆記
const getShareNotes = async (
  paging,
  sorting,
  search_text,
  search_method,
  user_id,
  startDate,
  endDate
) => {
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  let startIsoDate;
  let endIsoDate;

  if (startDate && endDate) {
    const startYear = startDate.split('/')[2];
    const startMon = startDate.split('/')[0];
    const startDay = startDate.split('/')[1];
    const StartDateFormat = startYear + '-' + startMon + '-' + startDay;
    startIsoDate = new Date(StartDateFormat);

    const endYear = endDate.split('/')[2];
    const endMon = endDate.split('/')[0];
    const endDay = endDate.split('/')[1];
    const EndDateFormat = endYear + '-' + endMon + '-' + endDay;
    endIsoDate = new Date(EndDateFormat);
  }

  try {
    const cards_ToOnePage = 6;
    const skip = (paging - 1) * cards_ToOnePage;
    const limit = cards_ToOnePage;

    // sorting -----------------------------
    let sortObj = {};
    sortObj[sorting] = -1;

    // search_method -----------------------------
    let matchObj = { 'isSharing': 1 };
    let matchAterLookup;
    const re = new RegExp(search_text);

    switch (search_method) {
      case '標題':
        matchObj = { 'isSharing': 1, 'note_name': { $regex: re } };
        matchAterLookup = {};
        break;
      case '作者':
        matchObj = { 'isSharing': 1 };
        matchAterLookup = { 'user_info.name': { $regex: re } };
        break;
      case '時間':
        matchObj = {
          'isSharing': 1,
          'sharing_time': {
            '$gt': startIsoDate,
            '$lt': endIsoDate,
          },
        };
        matchAterLookup = {};
        break;
      case '簡介':
        matchObj = { 'isSharing': 1, 'sharing_descrition': { $regex: re } };
        matchAterLookup = {};
        break;
      case '內容':
        matchObj = { 'isSharing': 1 };
        matchAterLookup = { 'note_version_info.keywords': { $regex: re } };
        break;
      case '標籤':
        matchObj = {
          'isSharing': 1,
          'tags': { $in: [re] },
        };
        matchAterLookup = {};
        break;
      case '收藏':
        matchObj = {
          'isSharing': 1,
          'saved_user_id': user_id,
        };
        matchAterLookup = {};
        break;
      default:
        matchObj = { 'isSharing': 1 };
        matchAterLookup = {};
        break;
    }

    console.log('matchObj', matchObj);

    // 計算所有符合條件
    const allCards_count = await NotesCollection.aggregate([
      {
        '$match': matchObj,
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
      {
        $lookup: {
          from: 'note_version',
          localField: 'foreign_note_id',
          foreignField: 'note_id',
          as: 'note_version_info',
        },
      },
      { $match: matchAterLookup },
      { $count: 'isSharing' },
    ]).toArray();

    let allPages_count = 0;
    if (allCards_count.length != 0) {
      allPages_count = Math.ceil(allCards_count[0].isSharing / cards_ToOnePage);
    }
    // console.log('allPages_count: ', allPages_count);

    // console.log('allPages_count: ', allPages_count);

    // 顯示符合條件的Sharing Cards
    const cards_result = await NotesCollection.aggregate([
      {
        '$match': matchObj,
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
      {
        $lookup: {
          from: 'note_version',
          localField: 'foreign_note_id',
          foreignField: 'note_id',
          as: 'note_version_info',
        },
      },
      { $match: matchAterLookup },
      { $sort: sortObj },
    ])
      .skip(skip)
      .limit(limit)
      .toArray();

    cards_result.allPages_count = allPages_count;
    cards_result.currentPage = paging;

    return cards_result;
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
      { '$addFields': { 'user_id': { '$toObjectId': '$user_id' } } },
      {
        $lookup: {
          from: 'note_version',
          localField: 'note_id',
          foreignField: 'note_id',
          as: 'version_info',
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user_info',
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

// 收藏功能 - 更新資料庫
const createSave = async (note_id, user_id) => {
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  const UserCollection = Mongo.db(MONGO_DB).collection('user');
  try {
    // 檢查User是否已經點過這個
    // 更新saved_user_id
    // Update the Note saved_user_id ----------------------------
    await NotesCollection.updateOne(
      {
        _id: ObjectId(note_id),
      },
      [
        {
          $set: {
            saved_user_id: {
              $cond: [
                {
                  $in: [user_id, '$saved_user_id'],
                },
                {
                  $setDifference: ['$saved_user_id', [user_id]],
                },
                {
                  $concatArrays: ['$saved_user_id', [user_id]],
                },
              ],
            },
          },
        },
      ]
    );

    // 更新收藏數字
    const saved_count = await NotesCollection.aggregate([
      {
        '$match': { _id: ObjectId(note_id) },
      },
      { $project: { saved_count: { $size: '$saved_user_id' } } },
    ]).toArray();

    const note_saved_conut = saved_count[0].saved_count;
    console.log('saved_count', saved_count);

    // Update the User save Count ----------------------------
    await NotesCollection.updateOne(
      {
        _id: ObjectId(note_id),
      },
      [
        {
          $set: { 'saved_count': note_saved_conut },
        },
      ]
    );

    return note_saved_conut;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

const getShareToAll = async (note_id) => {
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  try {
    const result = await NotesCollection.aggregate([
      {
        '$match': {
          '_id': ObjectId(note_id),
        },
      },
    ])
      .project({
        'isSharing': 1,
        'url_permission': 1,
        'sharing_descrition': 1,
        'sharing_image': 1,
        'sharing_url': 1,
        'sharing_time': 1,
        'tags': 1,
      })
      .toArray();

    console.log('getShareAll', result);
    return result;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 新創留言
const createComment = async (data) => {
  const CommentsCollection = Mongo.db(MONGO_DB).collection('comments');
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');

  try {
    data.created_time = new Date();
    data.updated_time = new Date();
    const result = await CommentsCollection.insertOne(data);
    const comment_id = result.insertedId.toString();
    const note_id = data.note_id;

    const comment_count = await CommentsCollection.countDocuments({
      'note_id': note_id,
    });

    console.log('comment_count: ', comment_count);

    const update_result = await NotesCollection.findOneAndUpdate(
      { '_id': ObjectId(note_id) },
      { $set: { 'comment_count': comment_count } }
    );

    console.log('update_result', update_result);
    return comment_id;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 更新留言
const updateComment = async (data) => {
  const CommentsCollection = Mongo.db(MONGO_DB).collection('comments');
  try {
    const comment_id = data.comment_id;
    const user_id = data.user_id;
    const new_content = data.new_content;

    const result = await CommentsCollection.findOneAndUpdate(
      {
        '_id': ObjectId(comment_id),
        'user_id': user_id,
      },
      {
        $set: { 'contents': new_content },
      }
    );

    if (!result.lastErrorObject.updatedExisting) {
      // 無權修改別人留言
      return 0;
    } else {
      // 修改留言成功
      return 1;
    }
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 刪除留言
const deleteComment = async (data) => {
  const CommentsCollection = Mongo.db(MONGO_DB).collection('comments');
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
  try {
    const comment_id = data.comment_id;
    const user_id = data.user_id;
    const note_id = data.note_id;

    const result = await CommentsCollection.deleteOne({
      '_id': ObjectId(comment_id),
      'user_id': user_id,
    });

    const comment_count = await CommentsCollection.countDocuments({
      'note_id': note_id,
    });

    console.log('delete_comment_count', comment_count);
    console.log('note_id', note_id);

    const updateResult = await NotesCollection.findOneAndUpdate(
      { '_id': ObjectId(note_id) },
      { $set: { 'comment_count': comment_count } }
    );

    console.log('updateResult:', updateResult);

    if (result.deletedCount === 0) {
      // 無權刪除別人留言
      return 0;
    } else {
      // 刪除留言成功
      return 1;
    }
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 權限管理 ----------------------------------------------------------
// 社群頁面
const getSocialAuth = async (user_email, note_id) => {
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');

  try {
    const isOwnNote_result = await NotesCollection.aggregate([
      {
        '$match': {
          '_id': ObjectId(note_id),
        },
      },
      { '$addFields': { 'foreign_user_id': { '$toObjectId': '$user_id' } } },
      {
        $lookup: {
          from: 'user',
          localField: 'foreign_user_id',
          foreignField: '_id',
          as: 'user_info',
        },
      },
    ])
      .project({ 'user_info': 1 })
      .toArray();

    let note_owner = isOwnNote_result[0].user_info[0].email;
    if (note_owner == user_email) {
      return authorizationList['admin'];
    }

    const user_permission_result = await NotesCollection.aggregate([
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

    const url_permission_result = await NotesCollection.find({
      '_id': ObjectId(note_id),
    })
      .project({ 'url_permission': 1 })
      .toArray();

    // 檢查 url_permission & user_permission
    // 皆以 user_permission 為主，0 代表 沒有開特定人的權限
    let final_permission;
    let user_permission;
    let url_permission = url_permission_result[0].url_permission;
    if (user_permission_result.length === 0) {
      // 沒有user_permission
      user_permission = 0;
      final_permission = url_permission;
    } else {
      // 有user_permission
      user_permission = user_permission_result[0].sharing_user.permission;
      final_permission = user_permission;
    }
    console.log(user_permission, url_permission);

    return final_permission;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 筆記頁面
const getNoteAuth = async (user) => {
  const user_id = user.id;
  const user_email = user.email;

  const UserCollection = Mongo.db(MONGO_DB).collection('user');
  const NoteCollection = Mongo.db(MONGO_DB).collection('notes');

  let note_id_permission = [];
  try {
    // 拿取自己筆記的權限
    const ownNotes = await UserCollection.aggregate([
      {
        '$match': {
          '_id': ObjectId(user_id),
        },
      },
      { '$addFields': { 'foreign_user_id': { '$toString': '$_id' } } },
      {
        $lookup: {
          from: 'notes',
          localField: 'foreign_user_id',
          foreignField: 'user_id',
          as: 'note_info',
        },
      },
    ])
      .project({ 'note_info._id': 1 })
      .toArray();

    // console.log('ownNotes: ', ownNotes[0].note_info);
    let note_ids = ownNotes[0].note_info;

    note_ids.map((i) => {
      let permission = {};
      let note_id = i._id.toString();
      permission[note_id] = authorizationList['admin'];
      note_id_permission.push(permission);
    });

    // console.log(note_id_permission);

    // 拿取他人筆記分享的權限
    const shareNote = await NoteCollection.aggregate([
      {
        '$match': {
          sharing_user: { $elemMatch: { user_email: user_email } },
        },
      },
    ])
      .project({ '_id': 1, 'sharing_user': 1, 'user_id': 1 })
      .toArray();

    // sharing_user的permission值
    shareNote.map((s) => {
      let obj = {};
      const note_id = s._id.toString();
      let user_email_values = Object.values(s.sharing_user);
      user_email_values.map((u) => {
        if (u.user_email == user_email) {
          obj[note_id] = u.permission;
          note_id_permission.push(obj);
        }
      });
    });

    console.log(note_id_permission);

    return note_id_permission;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 註釋權限
const getAnnotationAuth = async (user_email, note_id, user_id) => {
  const NoteCollection = Mongo.db(MONGO_DB).collection('notes');

  try {
    // 確認是否為自己筆記
    const ownNote = await NoteCollection.aggregate([
      {
        '$match': {
          '_id': ObjectId(note_id),
          'user_id': user_id,
        },
      },
    ]).toArray();

    // 確認是否為自己的筆記
    if (ownNote.length == 1) {
      return 16;
    }

    // 拿取該筆記分享給這個使用者的權限
    const sharedUsers = await NoteCollection.aggregate([
      {
        '$match': {
          '_id': ObjectId(note_id),
          sharing_user: { $elemMatch: { user_email: user_email } },
        },
      },
    ])
      .project({ '_id': 1, 'sharing_user': 1, 'user_id': 1 })
      .toArray();

    // 找不到則為沒權限
    let permission = 0;
    if (sharedUsers.length == 0) {
      return 0;
    }
    // sharing_user的permission值
    sharedUsers.map((s) => {
      let user_email_values = Object.values(s.sharing_user);
      user_email_values.map((u) => {
        if (u.user_email == user_email) {
          permission = u.permission;
        }
      });
    });

    return permission;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// [註釋] ----------------------------------------------------------
// 新增註釋
const updateAnnotation = async (
  note_id,
  annotion_user_id,
  annotation_icon_html,
  annotation_textarea,
  annotation_user_name
) => {
  const AnnotationCollection = Mongo.db(MONGO_DB).collection('annotation');
  const NotesCollection = Mongo.db(MONGO_DB).collection('notes');

  console.log('1111note_id:', note_id);
  // let note_id_permission = [];
  try {
    // 新增筆記內，本次新增註釋的使用者
    await NotesCollection.updateOne(
      {
        _id: ObjectId(note_id),
      },
      [
        {
          $set: {
            annotation_user_id: {
              $cond: [
                {
                  $in: [annotion_user_id, '$annotation_user_id'],
                },
                {
                  $setDifference: ['$annotation_user_id', [annotion_user_id]],
                },
                {
                  $concatArrays: ['$annotation_user_id', [annotion_user_id]],
                },
              ],
            },
          },
        },
      ]
    );

    await AnnotationCollection.updateOne(
      {
        note_id: note_id,
      },
      {
        $set: {
          user_id: annotion_user_id,
          note_id: note_id,
          annotation_icon_html: annotation_icon_html,
          annotation_textarea: annotation_textarea,
          annotation_user_name: annotation_user_name,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

// 拿取註釋 ---------------------------------------------------------
const getAnnotation = async (note_id) => {
  const AnnotationCollection = Mongo.db(MONGO_DB).collection('annotation');
  try {
    const result = await AnnotationCollection.aggregate([
      {
        '$match': {
          'note_id': note_id,
        },
      },
    ]).toArray();

    // console.log('getAnnotation: ', result);
    return result;
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

module.exports = {
  writeNote,
  deleteNote,
  renameNote,
  moveNote,
  renameNoteClass,
  deleteNoteClass,
  createNoteVersion,
  getUserNotes,
  shareToAll,
  getShareToAll,
  shareToOther,
  deleteShareToOther,
  getShareToOther,
  getShareNotes,
  getNoteById,
  createComment,
  updateComment,
  getSocialAuth,
  getNoteAuth,
  getComments,
  deleteComment,
  createSave,
  updateAnnotation,
  getAnnotation,
  getAnnotationAuth,
};
