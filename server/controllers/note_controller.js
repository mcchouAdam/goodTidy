const Notes = require('../models/note_model');
const { showShareToOtherList } = require('../../utils/showPage');
require('dotenv').config();

const { S3_HOST } = process.env;

// [頁面呈現] 渲染編輯筆記
const showNote = async (req, res) => {
  const { id } = req.session.user;
  const { provider } = req.session.user;
  const { name } = req.session.user;
  const { email } = req.session.user;
  const picture = `${S3_HOST}/user_picture/${req.session.user.picture}`;

  return res.status(200).render('note', {
    id,
    provider,
    name,
    email,
    picture,
  });
};

// [頁面呈現] 渲染編輯筆記
const showUploadNote = async (req, res) => {
  const { id } = req.session.user;
  const { provider } = req.session.user;
  const { name } = req.session.user;
  const { email } = req.session.user;
  const picture = `${S3_HOST}/user_picture/${req.session.user.picture}`;

  return res.status(200).render('uploadNote', {
    id,
    provider,
    name,
    email,
    picture,
  });
};

// 新創筆記
const createNote = async (req, res) => {
  const note = req.body;
  note.file_name = req.filename;

  const note_id = await Notes.writeNote(note);
  return res.status(200).json({ data: note_id });
};

// 改名筆記
const renameNote = async (req, res) => {
  const { note_id } = req.body;
  const { new_noteName } = req.body;
  const result = await Notes.renameNote(note_id, new_noteName);
  return res.status(200).json('rename note successfully.');
};

// 刪除筆記
const deleteNote = async (req, res) => {
  const { note_id } = req.body;
  const result = await Notes.deleteNote(note_id);
  return res.status(200).json('delete note successfully.');
};

// 搬移筆記
const moveNote = async (req, res) => {
  const { note_id } = req.body;
  const { MoveToClass } = req.body;
  const result = await Notes.moveNote(note_id, MoveToClass);
  return res.status(200).json('move note_classification successfully.');
};

// 改名分類
const renameNoteClass = async (req, res) => {
  // const user_id = req.body.user_id;
  // const old_classificationName = req.body.old_classificationName;
  // const new_classificationName = req.body.new_classificationName;
  const { user_id, old_classificationName, new_classificationName } = req.body;

  const result = await Notes.renameNoteClass(
    user_id,
    old_classificationName,
    new_classificationName
  );
  return res.status(200).json('rename note successfully.');
};

// 刪除分類
const deleteNoteClass = async (req, res) => {
  const { user_id } = req.body;
  const { classificationName } = req.body;

  const result = await Notes.deleteNoteClass(user_id, classificationName);
  return res.status(200).json('rename note successfully.');
};

const createNoteVersion = async (req, res) => {
  // console.log(req.body);
  const version_info = req.body;
  const result = await Notes.createNoteVersion(version_info);

  return res.status(200).json(result);
};

const getNote = async (req, res) => res.render('note');

const getUserNotes = async (req, res) => {
  // const user_id = req.user.id;
  const { note_permission } = req;
  const result = await Notes.getUserNotes(note_permission);

  return res.status(200).json(result);
};

const shareToAll = async (req, res) => {
  req.body.user_id = req.session.user.user_id;
  const data = req.body;
  data.file_name = req.filename;

  // console.log('shareToAll: ', data);

  const share = await Notes.shareToAll(data);
  return res.status(200).send(share);
};

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

  if (user_email == shareUser_email) {
    return res.status(403).json({ msg: '您是此篇筆記的使用者' });
  }

  const share = await Notes.shareToOther(data);
  if (share === '此用戶不存在') {
    return res.status(403).json({ msg: '此用戶不存在' });
  }

  return res.status(200).json(share);
};

// 刪除對特定人的分享
const deleteShareToOther = async (req, res) => {
  const user_name = req.session.user.name;
  const { note_id } = req.body;
  const { delete_email } = req.body;

  await Notes.deleteShareToOther(note_id, delete_email, user_name);
  return res.status(200).json({ msg: `${delete_email}刪除成功` });
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
  // const shareList_html = await showShareToOtherList(shareList, note_id);
  return res.status(200).json(saveResult);
};

// [註釋] --------------------------------------------------
// 新增註釋
const updateAnnotation = async (req, res) => {
  // 檢查權限
  const { permission } = req;
  console.log('permission:', permission);

  if (permission < 2) {
    return res.status(403).json({ msg: '您無權限新增/修改/刪除/註釋' });
  }

  const { note_id } = req.body;
  const { annotion_user_id } = req.body;
  const { annotation_icon_html } = req.body;
  const annotation_textarea = JSON.parse(req.body.annotation_textarea);
  const annotation_user_name = JSON.parse(req.body.annotation_user_name);

  const createResult = await Notes.updateAnnotation(
    note_id,
    annotion_user_id,
    annotation_icon_html,
    annotation_textarea,
    annotation_user_name
  );

  return res.status(200).json({ msg: '新增註釋成功' });
};

// 拿取註釋
const getAnnotation = async (req, res) => {
  const { note_id } = req.params;
  const { annotion_user_id } = req.params;

  const getResult = await Notes.getAnnotation(note_id, annotion_user_id);
  return res.status(200).json(getResult);
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
