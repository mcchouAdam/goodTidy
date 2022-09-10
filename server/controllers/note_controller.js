const { ConditionFilterSensitiveLog } = require('@aws-sdk/client-s3');
const Notes = require('../models/note_model');

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

const createNotePage = async (req, res) => {
  res.render('createNote');
};

const getUserNotes = async (req, res) => {
  const user_id = req.user.id;
  const result = await Notes.getUserNotes(user_id);

  return res.status(200).json(result);
};

const shareToAll = async (req, res) => {
  console.log(req.user.user_id);
  console.log(req.body);

  req.body.user_id = req.user.user_id;
  const data = req.body;

  const share = await Notes.shareToAll(data);
  return res.status(200).send(share);
};

module.exports = {
  createNote,
  createNoteVersion,
  editNotePage,
  createNotePage,
  getUserNotes,
  shareToAll,
};
