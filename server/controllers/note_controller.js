const Notes = require('../models/note_model');

const writeNote = async (req, res) => {
  const note = req.body;
  note.file_name = req.filename;
  const result = await Notes.writeNote(note);
  const { note_id } = req.params;

  return res.status(200).json('upload note successfully.');
};

const readNote = async (req, res) => {
  console.log(req.params);

  // TODO: 註冊還沒寫，user_id 先寫死
  const user_id = '6319835b38dbe8b04a223aaf';
  const { note_id } = req.params;

  const result = await Notes.readNote(user_id, note_id);

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

module.exports = {
  writeNote,
  readNote,
  editNotePage,
  createNotePage,
  getUserNotes,
};
