const validator = require('validator');
const Notes = require('../models/note_model');
const { showShareToOtherList } = require('../../utils/showPage');
require('dotenv').config();

const { S3_HOST } = process.env;
const { authorizationList } = require('../../utils/authorization');

// [頁面呈現] 渲染編輯筆記
const showNote = async (req, res) => {
  const { id, provider, name, email } = req.session.user;
  const picture = `${S3_HOST}/user_picture/${req.session.user.picture}`;

  return res.status(200).render('note', {
    id,
    provider,
    name,
    email,
    picture,
  });
};

// [頁面呈現] Render筆記上傳頁面
const showUploadNote = async (req, res) => {
  const { id, provider, name, email } = req.session.user;
  const picture = `${S3_HOST}/user_picture/${req.session.user.picture}`;

  return res.status(200).render('uploadNote', {
    id,
    provider,
    name,
    email,
    picture,
  });
};

// 建立新筆記
const createNote = async (req, res) => {
  const note = req.body;
  note.file_name = req.filename;

  if (
    !validator.isLength(note.note_name, {
      max: 16,
    })
  ) {
    return res.status(400).json({
      error: '筆記名稱字數最多16',
    });
  }

  const note_id = await Notes.writeNote(note);
  return res.status(200).json({
    data: note_id,
  });
};

// 改名筆記
const renameNote = async (req, res) => {
  const { note_id, new_noteName } = req.body;
  await Notes.renameNote(note_id, new_noteName);
  return res.status(200).json('rename note successfully.');
};

// 刪除筆記
const deleteNote = async (req, res) => {
  const { note_id } = req.body;
  await Notes.deleteNote(note_id);
  return res.status(200).json('delete note successfully.');
};

// 搬移筆記
const moveNote = async (req, res) => {
  const { note_id, MoveToClass } = req.body;
  console.log('movenote:', note_id);
  await Notes.moveNote(note_id, MoveToClass);
  return res.status(200).json('move note_classification successfully.');
};

// 改名分類
const renameNoteClass = async (req, res) => {
  const { user_id, old_classificationName, new_classificationName } = req.body;

  await Notes.renameNoteClass(
    user_id,
    old_classificationName,
    new_classificationName
  );
  return res.status(200).json('rename note successfully.');
};

// 刪除分類
const deleteNoteClass = async (req, res) => {
  const { user_id, classificationName } = req.body;

  await Notes.deleteNoteClass(user_id, classificationName);
  return res.status(200).json('rename note successfully.');
};

// 創立筆記版本
const createNoteVersion = async (req, res) => {
  // console.log(req.body);
  const version_info = req.body;
  const result = await Notes.createNoteVersion(version_info);

  return res.status(200).json(result);
};

// 拿筆記
const getNote = async (req, res) => res.render('note');

const getUserNotes = async (req, res) => {
  // const user_id = req.user.id;
  const { note_permission } = req;
  const result = await Notes.getUserNotes(note_permission);

  return res.status(200).json(result);
};

// 分享給全部人
const shareToAll = async (req, res) => {
  req.body.user_id = req.session.user.user_id;
  const data = req.body;
  data.file_name = req.filename;

  const share = await Notes.shareToAll(data);
  return res.status(200).send(share);
};

// 拿取該筆記的
const getShareToAll = async (req, res) => {
  const { note_id } = req.params;
  const share = await Notes.getShareToAll(note_id);
  return res.status(200).send(share);
};

// 刪除對所有人的分享
const deleteShareToAll = async (req, res) => {
  const { note_id } = req.body;
  const share_result = await Notes.deleteShareToAll(note_id);

  return res.status(200).json(share_result);
};

// 分享對特定人的分享
const shareToOther = async (req, res) => {
  const data = req.body;
  const user_email = data.addPerson;
  const shareUser_email = req.session.user.email;
  req.body.user_id = req.session.user.id;
  req.body.shareUser_email = shareUser_email;

  if (user_email === shareUser_email) {
    return res.status(403).json({
      data: '您是此篇筆記的使用者',
    });
  }

  const share = await Notes.shareToOther(data);
  if (share === '此用戶不存在') {
    return res.status(403).json({
      data: '此用戶不存在',
    });
  }

  return res.status(200).json(share);
};

// 刪除對特定人的分享
const deleteShareToOther = async (req, res) => {
  const user_name = req.session.user.name;
  const { note_id, delete_email } = req.body;

  await Notes.deleteShareToOther(note_id, delete_email, user_name);
  return res.status(200).json({
    data: `${delete_email}刪除成功`,
  });
};

// 印出該使用者分享給特定人的資訊
const getShareToOther = async (req, res) => {
  // const user_id = req.session.user.id;
  const { note_id } = req.params;
  const current_user_id = req.session.user.id;

  const shareList = await Notes.getShareToOther(note_id, current_user_id);
  const shareList_html = await showShareToOtherList(shareList, note_id);
  return res.json(shareList_html);
};

// 儲存筆記
const saveNote = async (req, res) => {
  const { note_id } = req.body;
  const user_id = req.session.user.id;
  const user_email = req.session.user.email;
  const user_name = req.session.user.name;

  const saveResult = await Notes.createSave(
    note_id,
    user_id,
    user_email,
    user_name
  );
  return res.status(200).json(saveResult);
};

// [註釋] --------------------------------------------------
// 新增註釋
const updateAnnotation = async (req, res) => {
  // 檢查權限
  const { permission } = req;

  if (permission < authorizationList.comment) {
    return res.status(403).json({
      data: '您無權限新增/修改/刪除/註釋',
    });
  }

  const { note_id, annotion_user_id, annotation_icon_html } = req.body;
  const annotation_textarea = JSON.parse(req.body.annotation_textarea);
  const annotation_user_name = JSON.parse(req.body.annotation_user_name);

  await Notes.updateAnnotation(
    note_id,
    annotion_user_id,
    annotation_icon_html,
    annotation_textarea,
    annotation_user_name
  );

  return res.status(200).json({
    data: '新增註釋成功',
  });
};

// 拿取註釋
const getAnnotation = async (req, res) => {
  const { note_id, annotion_user_id } = req.params;

  const getResult = await Notes.getAnnotation(note_id, annotion_user_id);
  return res.status(200).json({
    data: getResult,
  });
};

module.exports = {
  showNote,
  createNote,
  deleteNote,
  renameNote,
  moveNote,
  renameNoteClass,
  deleteNoteClass,
  createNoteVersion,
  getNote,
  getUserNotes,
  shareToAll,
  getShareToAll,
  deleteShareToAll,
  shareToOther,
  deleteShareToOther,
  getShareToOther,
  saveNote,
  updateAnnotation,
  getAnnotation,
  showUploadNote,
};
