const { ConditionFilterSensitiveLog } = require('@aws-sdk/client-s3');
const Notes = require('../models/note_model');
const { showShareToOtherList } = require('../../utils/showPage');

// 新創筆記
const createNote = async (req, res) => {
  const note = req.body;
  note.file_name = req.filename;
  const result = await Notes.writeNote(note);
  // const { note_id } = req.params;

  return res.status(200).json('upload note successfully.');
};

// 改名筆記
const renameNote = async (req, res) => {
  const note_id = req.body.note_id;
  const new_noteName = req.body.new_noteName;
  const result = await Notes.renameNote(note_id, new_noteName);
  return res.status(200).json('rename note successfully.');
};

// 刪除筆記
const deleteNote = async (req, res) => {
  const note_id = req.body.note_id;
  const result = await Notes.deleteNote(note_id);
  return res.status(200).json('delete note successfully.');
};

// 搬移筆記
const moveNote = async (req, res) => {
  const note_id = req.body.note_id;
  const MoveToClass = req.body.MoveToClass;
  const result = await Notes.moveNote(note_id, MoveToClass);
  return res.status(200).json('move note_classification successfully.');
};

// 改名分類
const renameNoteClass = async (req, res) => {
  const user_id = req.body.user_id;
  const old_classificationName = req.body.old_classificationName;
  const new_classificationName = req.body.new_classificationName;

  const result = await Notes.renameNoteClass(
    user_id,
    old_classificationName,
    new_classificationName
  );
  return res.status(200).json('rename note successfully.');
};

// 刪除分類
const deleteNoteClass = async (req, res) => {
  const user_id = req.body.user_id;
  const classificationName = req.body.classificationName;

  const result = await Notes.deleteNoteClass(user_id, classificationName);
  return res.status(200).json('rename note successfully.');
};

const createNoteVersion = async (req, res) => {
  console.log(req.body);
  const version_info = req.body;
  const result = await Notes.createNoteVersion(version_info);

  return res.status(200).json(result);
};

const editNotePage = async (req, res) => {
  if (!req.params.note_id) {
    res.render('updateNote');
  } else {
    const user_id = req.user.id;
    const { note_id } = req.params;

    const result = await Notes.readNote(user_id, note_id);

    res.status(200).json(result);
  }
};

const getUserNotes = async (req, res) => {
  const user_id = req.session.user.id;
  const result = await Notes.getUserNotes(user_id);

  return res.status(200).json(result);
};

const shareToAll = async (req, res) => {
  req.body.user_id = req.session.user.user_id;
  const data = req.body;
  data.file_name = req.filename;

  const share = await Notes.shareToAll(data);
  return res.status(200).send(share);
};

const getShareToAll = async (req, res) => {
  const note_id = req.params.note_id;
  const share = await Notes.getShareToAll(note_id);
  return res.status(200).send(share);
};

const shareToOther = async (req, res) => {
  req.body.user_id = req.session.user.id;
  const data = req.body;

  const share = await Notes.shareToOther(data);
  return res.json(share);
};

const getShareToOther = async (req, res) => {
  // const user_id = req.session.user.id;
  const note_id = req.params.note_id;
  const current_user_id = req.session.user.id;

  const shareList = await Notes.getShareToOther(note_id, current_user_id);
  const shareList_html = await showShareToOtherList(shareList, note_id);
  return res.json(shareList_html);
};

const saveNote = async (req, res) => {
  const note_id = req.body.note_id;
  const user_id = req.body.user_id;

  const saveResult = await Notes.createSave(note_id, user_id);
  // const shareList_html = await showShareToOtherList(shareList, note_id);
  return res.status(200).json(saveResult);
};

module.exports = {
  createNote,
  deleteNote,
  renameNote,
  moveNote,
  renameNoteClass,
  deleteNoteClass,
  createNoteVersion,
  editNotePage,
  getUserNotes,
  shareToAll,
  getShareToAll,
  shareToOther,
  getShareToOther,
  saveNote,
};
