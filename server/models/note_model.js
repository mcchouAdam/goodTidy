const { ObjectId } = require('mongodb');
const {
  Mongo,
  noteVersionCollection,
  noteCollection,
  commentCollection,
  annotationCollection,
  messageCollection,
  userCollection,
} = require('./mongocon');
const { authorizationList } = require('../../utils/authorization');


// [筆記頁面] 上傳筆記
const writeNote = async (note) => {
  const session = Mongo.startSession();
  try {
    // console.log('上傳筆記 writeNote');

    const transactionOptions = {
      readPreference: 'primary',
      readConcern: {
        level: 'local',
      },
      writeConcern: {
        w: 'majority',
      },
    };

    let noteId;
    await session.withTransaction(async () => {
      const noteObj = {
        user_id: note.user_id,
        note_name: note.note_name,
        file_name: note.file_name,
        note_classification: note.note_classification,
        created_time: new Date(),
        lastVersion: note.version_name,
        comment_count: 0,
        saved_count: 0,
        saved_user_id: [],
        tags: [],
        annotation_user_id: [],
      };

      const noteCreateResult = await noteCollection.insertOne(noteObj);
      noteId = noteCreateResult.insertedId.toString();

      // console.log('note_result', note_result);

      const versionObj = {
        note_id: noteId,
        created_time: new Date(),
        // 'file_name': note.file_name,   // 目前不改使用者上傳圖片
        version_img: note.version_img, // TODO: 目前version_img 為 null
        version_name: note.version_name,
        elements: note.elements,
        keywords: note.keywords,
        text_elements: JSON.parse(note.text_elements),
      };

      await noteVersionCollection.insertOne(versionObj);
    }, transactionOptions);

    //  ------------------------------------------
    return noteId;
  } catch (error) {
    return {
      error,
    };
  } finally {
    await session.endSession();
  }
};

// 創立筆記版本
const createNoteVersion = async (version_info) => {
  try {
    // 新增版本
    version_info.text_elements = JSON.parse(version_info.text_elements);
    version_info.created_time = new Date();
    await noteVersionCollection.insertOne(version_info);
    const { note_id, version_name } = version_info;

    // change the attribute lastVersion in collection [note]
    await noteCollection.findOneAndUpdate(
      {
        _id: ObjectId(note_id),
      },
      {
        $set: {
          lastVersion: version_name,
        },
      }
    );
    return res.status(200).send('update note version successfully!');
  } catch (error) {
    return {
      error,
    };
  }
};

const getUserNotes = async (note_permission) => {
  try {
    const note_ids = [];
    const permissions = [];
    const ids = [];
    note_permission.map((n) => {
      note_ids.push(ObjectId(Object.keys(n)[0]));
      ids.push(Object.keys(n)[0]);
      permissions.push(Object.values(n)[0]);
    });

    // console.log('ids', ids);
    // console.log('permissions', permissions);

    const result = await noteCollection
      .aggregate([
        {
          $match: {
            _id: {
              $in: note_ids,
            },
          },
        },
        {
          $addFields: {
            note_id: {
              $toString: '$_id',
            },
          },
        },
        {
          $addFields: {
            user_id: {
              $toObjectId: '$user_id',
            },
          },
        },
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
      ])
      .toArray();

    for (let i = 0; i < result.length; i++) {
      // const id = ids[i];
      const index = ids.indexOf(result[i].note_id);
      result[i].user_permission = permissions[index];
    }

    return result;
  } catch (error) {
    return {
      error,
    };
  }
};

// 刪除筆記
const deleteNote = async (note_id) => {
  try {
    await noteCollection.deleteOne({
      _id: ObjectId(note_id),
    });
    await noteVersionCollection.deleteOne({
      note_id,
    });
    await commentCollection.deleteOne({
      note_id,
    });
    return 'delete successfully';
  } catch (error) {
    return {
      error,
    };
  }
};

// 改名筆記
const renameNote = async (note_id, new_noteName) => {
  try {
    await noteCollection.updateOne(
      {
        _id: ObjectId(note_id),
      },
      {
        $set: {
          note_name: new_noteName,
        },
      }
    );
    return 'rename successfully';
  } catch (error) {
    return {
      error,
    };
  }
};

// 搬移筆記
const moveNote = async (note_id, MoveToClass) => {
  try {
    await noteCollection.updateOne(
      {
        _id: ObjectId(note_id),
      },
      {
        $set: {
          note_classification: MoveToClass,
        },
      }
    );
    return 'move note_classification successfully';
  } catch (error) {
    return {
      error,
    };
  }
};

// 改名分類
const renameNoteClass = async (
  user_id,
  old_classificationName,
  new_classificationName
) => {
  try {
    await noteCollection.updateMany(
      {
        note_classification: old_classificationName,
        user_id,
      },
      {
        $set: {
          note_classification: new_classificationName,
        },
      }
    );
    return 'rename successfully';
  } catch (error) {
    return {
      error,
    };
  }
};

// 刪除分類
const deleteNoteClass = async (user_id, old_classificationName) => {
  try {
    const note_id = await noteCollection
      .aggregate([
        {
          $match: {
            user_id,
            note_classification: old_classificationName,
          },
        },
        {
          $addFields: {
            note_id_toString: {
              $toString: '$_id',
            },
          },
        },
      ])
      .project({
        note_id_toString: 1,
      })
      .toArray();

    const note_id_objectId = note_id.map((n) => n._id);
    const note_id_toString = note_id.map((n) => n.note_id_toString);

    // console.log('note_id_toString', note_id_toString);
    await noteCollection.deleteMany({
      _id: {
        $in: note_id_objectId,
      },
    });
    await noteVersionCollection.deleteMany({
      note_id: {
        $in: note_id_toString,
      },
    });
    await commentCollection.deleteMany({
      note_id: {
        $in: note_id_toString,
      },
    });
    return 'delete note_class successfully';
  } catch (error) {
    return {
      error,
    };
  }
};

// 分享給全部人
const shareToAll = async (data) => {
  const { note_id, sharing_descrition, sharing_url } = data;
  const isSharing = +data.isSharing;
  const url_permission = authorizationList[data.url_permission];
  const sharing_image = data.file_name;
  const tags = JSON.parse(data.tags);
  const sharing_time = new Date();

  // console.log('url_permission', url_permission);

  try {
    const result = await noteCollection.updateOne(
      {
        _id: ObjectId(note_id),
      },
      {
        $set: {
          isSharing,
          url_permission,
          sharing_url,
          sharing_descrition,
          sharing_image,
          tags,
          sharing_time,
        },
      }
    );
    // console.log(result);
    return result;
  } catch (error) {
    return {
      error,
    };
  }
};

const deleteShareToAll = async (note_id) => {
  try {
    const result = await noteCollection.updateOne(
      {
        _id: ObjectId(note_id),
      },
      {
        $set: {
          isSharing: 0,
          url_permission: 0,
        },
      }
    );

    return result;
  } catch (error) {
    return {
      error,
    };
  }
};

// 分享給特定的人
const shareToOther = async (data) => {
  const { note_id, shareUser_email } = data;
  const permission = authorizationList[data.permission];
  const user_email = data.addPerson;
  const insert_data = {
    user_email,
    permission,
  };

  try {
    // 確認加入的user是否存在
    const checkUserExist = await userCollection
      .find({
        email: user_email,
      })
      .toArray();

    const getShareUser = await userCollection
      .find({
        email: shareUser_email,
      })
      .toArray();

    const shareUser_name = getShareUser[0].name;

    if (checkUserExist.length === 0) {
      return '此用戶不存在';
    }

    // 更新note資料
    await noteCollection.updateOne(
      {
        _id: ObjectId(note_id),
      },
      {
        $addToSet: {
          sharing_user: insert_data,
        },
      }
    );

    // 更新使用者通知資料
    await messageCollection.insertOne({
      notify_user_email: user_email,
      note_id,
      type: '筆記分享',
      content: `${shareUser_name}分享一篇筆記給您`,
      created_time: new Date(),
    });

    return `${user_email} 新增成功`;
  } catch (error) {
    return {
      error,
    };
  }
};

// 拿取 特定人 權限
const getShareToOther = async (note_id) => {
  try {
    const result = await noteCollection
      .find({
        _id: ObjectId(note_id),
      })
      .project({
        sharing_user: 1,
      })
      .toArray();

    // console.log('getShareToOther: ', result);
    const shareUser_info = result[0].sharing_user;
    const shareUser_emails = [];
    const shareUser_permission = [];
    shareUser_info.map((s) => {
      shareUser_emails.push(s.user_email);
      shareUser_permission.push(s.permission);
    });

    const result_json = [];
    for (let i = 0; i < shareUser_emails.length; i++) {
      const data = {
        user_email: shareUser_emails[i],
        permission: shareUser_permission[i],
      };
      result_json.push(data);
    }
    console.log(result_json);

    return result_json;
  } catch (error) {
    return {
      error,
    };
  }
};

// TODO: 刪除對特定人分享更新資料庫
// 刪除對特定人分享
const deleteShareToOther = async (note_id, delete_email, user_name) => {
  try {
    await noteCollection.updateOne(
      {
        _id: ObjectId(note_id),
      },
      {
        $pull: {
          sharing_user: {
            user_email: delete_email,
          },
        },
      },
      false,
      true
    );

    // console.log('delete_email', delete_email, 'user_name', user_name);

    await messageCollection.insertOne({
      notify_user_email: delete_email,
      type: '分享取消',
      content: `${user_name}停止分享一篇筆記給您`,
      created_time: new Date(),
    });

    // console.log('noteResult:', noteResult);

    return `${delete_email} 刪除成功`;
  } catch (error) {
    return {
      error,
    };
  }
};

// 拿取 社群頁面 筆記
const getShareNotes = async (
  paging,
  sorting,
  search_text,
  search_method,
  user_id
  // startDate,
  // endDate
) => {
  let startIsoDate;
  let endIsoDate;

  if (search_method == '時間') {
    const startDate = search_text.split('-')[0];
    const endDate = search_text.split('-')[1];

    const startYear = startDate.split('/')[2];
    const startMon = startDate.split('/')[0];
    const startDay = startDate.split('/')[1];
    const StartDateFormat = `${startYear}-${startMon}-${startDay}`;
    startIsoDate = new Date(StartDateFormat);

    const endYear = endDate.split('/')[2];
    const endMon = endDate.split('/')[0];
    const endDay = endDate.split('/')[1];
    const EndDateFormat = `${endYear}-${endMon}-${endDay}`;
    endIsoDate = new Date(EndDateFormat);
  }

  try {
    const cards_ToOnePage = 6;
    const skip = (paging - 1) * cards_ToOnePage;
    const limit = cards_ToOnePage;

    // sorting -----------------------------
    const sortObj = {};
    sortObj[sorting] = -1;

    // search_method -----------------------------
    let matchObj = {
      isSharing: 1,
    };
    let matchAterLookup;
    const re = new RegExp(search_text);

    switch (search_method) {
      case '標題':
        matchObj = {
          isSharing: 1,
          note_name: {
            $regex: re,
          },
        };
        matchAterLookup = {};
        break;
      case '作者':
        matchObj = {
          isSharing: 1,
        };
        matchAterLookup = {
          'user_info.name': {
            $regex: re,
          },
        };
        break;
      case '時間':
        matchObj = {
          isSharing: 1,
          sharing_time: {
            $gt: startIsoDate,
            $lt: endIsoDate,
          },
        };
        matchAterLookup = {};
        break;
      case '簡介':
        matchObj = {
          isSharing: 1,
          sharing_descrition: {
            $regex: re,
          },
        };
        matchAterLookup = {};
        break;
      case '內容':
        matchObj = {
          isSharing: 1,
        };
        matchAterLookup = {
          'note_version_info.keywords': {
            $regex: re,
          },
        };
        break;
      case '標籤':
        matchObj = {
          isSharing: 1,
          tags: {
            $in: [re],
          },
        };
        matchAterLookup = {};
        break;
      case '收藏':
        matchObj = {
          isSharing: 1,
          saved_user_id: user_id,
        };
        matchAterLookup = {};
        break;
      default:
        matchObj = {
          isSharing: 1,
        };
        matchAterLookup = {};
        break;
    }

    // 計算所有符合條件
    const allCards_count = await noteCollection
      .aggregate([
        {
          $match: matchObj,
        },
        {
          $addFields: {
            foreign_user_id: {
              $toObjectId: '$user_id',
            },
          },
        },
        {
          $addFields: {
            foreign_note_id: {
              $toString: '$_id',
            },
          },
        },
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
        {
          $match: matchAterLookup,
        },
        {
          $count: 'isSharing',
        },
      ])
      .toArray();

    let allPages_count = 0;
    if (allCards_count.length != 0) {
      allPages_count = Math.ceil(allCards_count[0].isSharing / cards_ToOnePage);
    }

    // 顯示符合條件的Sharing Cards
    const cards_result = await noteCollection
      .aggregate([
        {
          $match: matchObj,
        },
        {
          $addFields: {
            foreign_user_id: {
              $toObjectId: '$user_id',
            },
          },
        },
        {
          $addFields: {
            foreign_note_id: {
              $toString: '$_id',
            },
          },
        },
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
        {
          $match: matchAterLookup,
        },
        {
          $sort: sortObj,
        },
      ])
      .skip(skip)
      .limit(limit)
      .toArray();

    cards_result.allPages_count = allPages_count;
    cards_result.currentPage = paging;

    return cards_result;
  } catch (error) {
    return {
      error,
    };
  }
};

const getNoteById = async (note_id) => {
  // const noteCollection = Mongo.db(MONGO_DB).collection('notes');
  try {
    const result = await noteCollection
      .aggregate([
        {
          $match: {
            _id: ObjectId(note_id),
          },
        },
        {
          $addFields: {
            note_id: {
              $toString: '$_id',
            },
          },
        },
        {
          $addFields: {
            user_id: {
              $toObjectId: '$user_id',
            },
          },
        },
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
      ])
      .toArray();
    // console.log(result);
    return result;
  } catch (error) {
    return {
      error,
    };
  }
};

const getComments = async (note_id) => {
  try {
    const result = await commentCollection
      .aggregate([
        {
          $match: {
            note_id,
          },
        },
      ])
      .toArray();
    // const comment_id = result.insertedId.toString();
    console.log(result);
    return result;
  } catch (error) {
    return {
      error,
    };
  }
};

// 收藏功能 - 更新資料庫
const createSave = async (note_id, user_id, user_email, user_name) => {
  try {
    // 檢查User是否已經點過這個
    // 拿取原本收藏數字
    const saved_count_previous = await noteCollection
      .aggregate([
        {
          $match: {
            _id: ObjectId(note_id),
          },
        },
        {
          $project: {
            saved_count: {
              $size: '$saved_user_id',
            },
          },
        },
      ])
      .toArray();

    // 更新筆記內的 saved_user_id ----------------------------
    await noteCollection.updateOne(
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
    const saved_count = await noteCollection
      .aggregate([
        {
          $match: {
            _id: ObjectId(note_id),
          },
        },
        {
          $project: {
            saved_count: {
              $size: '$saved_user_id',
            },
          },
        },
      ])
      .toArray();

    const note_saved_conut = saved_count[0].saved_count;
    const note_saved_count_previous = saved_count_previous[0].saved_count;

    // 更新筆記被收藏的數字 ----------------------------
    await noteCollection.updateOne(
      {
        _id: ObjectId(note_id),
      },
      [
        {
          $set: {
            saved_count: note_saved_conut,
          },
        },
      ]
    );

    // 撈出被收藏的使用者名稱 -------------------------------
    const result = await noteCollection
      .aggregate([
        {
          $match: {
            _id: ObjectId(note_id),
          },
        },
        {
          $addFields: {
            user_id: {
              $toObjectId: '$user_id',
            },
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
      ])
      .toArray();

    // ※ 目前收藏不用進入通知
    // 更新使用者Massage數字 ----------------------------
    // const addSaved = note_saved_conut - note_saved_count_previous;

    // if (addSaved == 1) {
    //   const saved_user_email = result[0].user_info[0].email;
    //   await messageCollection.insertOne({
    //     'notify_user_email': saved_user_email,
    //     'type': '收藏',
    //     'content': `${user_name}收藏了您的一篇筆記`,
    //     'created_time': new Date(),
    //   }).toArray();
    // }

    return note_saved_conut;
  } catch (error) {
    return {
      error,
    };
  }
};

const getShareToAll = async (note_id) => {
  try {
    const result = await noteCollection
      .aggregate([
        {
          $match: {
            _id: ObjectId(note_id),
          },
        },
      ])
      .project({
        isSharing: 1,
        url_permission: 1,
        sharing_descrition: 1,
        sharing_image: 1,
        sharing_url: 1,
        sharing_time: 1,
        tags: 1,
      })
      .toArray();

    console.log('getShareAll', result);
    return result;
  } catch (error) {
    return {
      error,
    };
  }
};

// 新創留言
const createComment = async (data) => {
  try {
    data.created_time = new Date();
    data.updated_time = new Date();
    const result = await commentCollection.insertOne(data);
    const comment_id = result.insertedId.toString();
    const { note_id } = data;

    const comment_count = await commentCollection.countDocuments({
      note_id,
    });

    console.log('comment_count: ', comment_count);

    const update_result = await noteCollection.findOneAndUpdate(
      {
        _id: ObjectId(note_id),
      },
      {
        $set: {
          comment_count,
        },
      }
    );

    console.log('update_result', update_result);
    const obj = {
      comment_id,
      created_time: data.created_time,
    };
    return obj;
  } catch (error) {
    return {
      error,
    };
  }
};

// 更新留言
const updateComment = async (data) => {
  try {
    const { comment_id, user_id, new_content } = data;

    const result = await commentCollection.findOneAndUpdate(
      {
        _id: ObjectId(comment_id),
        user_id,
      },
      {
        $set: {
          contents: new_content,
        },
      }
    );

    if (!result.lastErrorObject.updatedExisting) {
      // 無權修改別人留言
      return 0;
    }
    // 修改留言成功
    return 1;
  } catch (error) {
    return {
      error,
    };
  }
};

// 刪除留言
const deleteComment = async (data) => {
  try {
    const { comment_id, user_id, note_id } = data;

    const result = await commentCollection.deleteOne({
      _id: ObjectId(comment_id),
      user_id,
    });

    const comment_count = await commentCollection.countDocuments({
      note_id,
    });

    // console.log('delete_comment_count', comment_count);
    // console.log('note_id', note_id);

    const updateResult = await noteCollection.findOneAndUpdate(
      {
        _id: ObjectId(note_id),
      },
      {
        $set: {
          comment_count,
        },
      }
    );

    console.log('updateResult:', updateResult);

    if (result.deletedCount === 0) {
      // 無權刪除別人留言
      return 0;
    }
    // 刪除留言成功
    return 1;
  } catch (error) {
    return {
      error,
    };
  }
};

// 權限管理 ----------------------------------------------------------
// 社群頁面
const getSocialAuth = async (user_email, note_id) => {
  try {
    const isOwnNote_result = await noteCollection
      .aggregate([
        {
          $match: {
            _id: ObjectId(note_id),
          },
        },
        {
          $addFields: {
            foreign_user_id: {
              $toObjectId: '$user_id',
            },
          },
        },
        {
          $lookup: {
            from: 'user',
            localField: 'foreign_user_id',
            foreignField: '_id',
            as: 'user_info',
          },
        },
      ])
      .project({
        user_info: 1,
      })
      .toArray();

    const note_owner = isOwnNote_result[0].user_info[0].email;
    if (note_owner == user_email) {
      return authorizationList.admin;
    }

    const user_permission_result = await noteCollection
      .aggregate([
        {
          $match: {
            _id: ObjectId(note_id),
          },
        },
        {
          $unwind: '$sharing_user',
        },
        {
          $match: {
            'sharing_user.user_email': user_email,
          },
        },
      ])
      .project({
        'sharing_user.permission': 1,
      })
      .toArray();

    const url_permission_result = await noteCollection
      .find({
        _id: ObjectId(note_id),
      })
      .project({
        url_permission: 1,
      })
      .toArray();

    // 檢查 url_permission & user_permission
    // 皆以 user_permission 為主，0 代表 沒有開特定人的權限
    let final_permission;
    let user_permission;
    const { url_permission } = url_permission_result[0];
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
    return {
      error,
    };
  }
};

// 筆記頁面
const getNoteAuth = async (user) => {
  const user_id = user.id;
  const user_email = user.email;

  const note_id_permission = [];
  try {
    // 拿取自己筆記的權限
    const ownNotes = await userCollection
      .aggregate([
        {
          $match: {
            _id: ObjectId(user_id),
          },
        },
        {
          $addFields: {
            foreign_user_id: {
              $toString: '$_id',
            },
          },
        },
        {
          $lookup: {
            from: 'notes',
            localField: 'foreign_user_id',
            foreignField: 'user_id',
            as: 'note_info',
          },
        },
      ])
      .project({
        'note_info._id': 1,
      })
      .toArray();

    // console.log('ownNotes: ', ownNotes[0].note_info);
    const note_ids = ownNotes[0].note_info;

    note_ids.map((i) => {
      const permission = {};
      const note_id = i._id.toString();
      permission[note_id] = authorizationList.admin;
      note_id_permission.push(permission);
    });

    // console.log(note_id_permission);

    // 拿取他人筆記分享的權限
    const shareNote = await noteCollection
      .aggregate([
        {
          $match: {
            sharing_user: {
              $elemMatch: {
                user_email,
              },
            },
          },
        },
      ])
      .project({
        _id: 1,
        sharing_user: 1,
        user_id: 1,
      })
      .toArray();

    // sharing_user的permission值
    shareNote.map((s) => {
      const obj = {};
      const note_id = s._id.toString();
      const user_email_values = Object.values(s.sharing_user);
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
    return {
      error,
    };
  }
};

// 註釋權限
const getAnnotationAuth = async (user_email, note_id, user_id) => {
  try {
    // 確認是否為自己筆記
    const ownNote = await noteCollection
      .aggregate([
        {
          $match: {
            _id: ObjectId(note_id),
            user_id,
          },
        },
      ])
      .toArray();

    // 確認是否為自己的筆記
    if (ownNote.length == 1) {
      return 16;
    }

    // 拿取該筆記分享給這個使用者的權限
    const sharedUsers = await noteCollection
      .aggregate([
        {
          $match: {
            _id: ObjectId(note_id),
            sharing_user: {
              $elemMatch: {
                user_email,
              },
            },
          },
        },
      ])
      .project({
        _id: 1,
        sharing_user: 1,
        user_id: 1,
      })
      .toArray();

    // 找不到則為沒權限
    let permission = 0;
    if (sharedUsers.length == 0) {
      return 0;
    }
    // sharing_user的permission值
    sharedUsers.map((s) => {
      const user_email_values = Object.values(s.sharing_user);
      user_email_values.map((u) => {
        if (u.user_email == user_email) {
          permission = u.permission;
        }
      });
    });

    return permission;
  } catch (error) {
    return {
      error,
    };
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
  // let note_id_permission = [];
  try {
    // 新增筆記內，本次新增註釋的使用者
    await noteCollection.updateOne(
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

    await annotationCollection.updateOne(
      {
        note_id,
      },
      {
        $set: {
          user_id: annotion_user_id,
          note_id,
          annotation_icon_html,
          annotation_textarea,
          annotation_user_name,
        },
      },
      {
        upsert: true,
      }
    );
  } catch (error) {
    return {
      error,
    };
  }
};

// 拿取註釋 ---------------------------------------------------------
const getAnnotation = async (note_id) => {
  try {
    const result = await annotationCollection
      .aggregate([
        {
          $match: {
            note_id,
          },
        },
      ])
      .toArray();

    return result;
  } catch (error) {
    return {
      error,
    };
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
  deleteShareToAll,
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
