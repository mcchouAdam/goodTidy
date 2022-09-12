const { ConditionFilterSensitiveLog } = require('@aws-sdk/client-s3');
const Notes = require('../models/note_model');
const { showShareToOtherList } = require('../../utils/showPage');

const createNote = async (req, res) => {
  const note = req.body;
  note.file_name = req.filename;
  const result = await Notes.writeNote(note);
  // const { note_id } = req.params;

  return res.status(200).json('upload note successfully.');
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

    console.log(user_id, note_id);
    const result = await Notes.readNote(user_id, note_id);
    console.log('result: ', result);
    res.status(200).json(result);
  }
};

// const createNotePage = async (req, res) => {
//   res.render('createNote');
// };

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
  createNoteVersion,
  editNotePage,
  // createNotePage,
  getUserNotes,
  shareToAll,
  getShareToAll,
  shareToOther,
  getShareToOther,
  saveNote,
};
