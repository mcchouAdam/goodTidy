const Notes = require('../models/note_model');

const writeNote = async (req, res) => {
  const note = req.body;
  const result = await Notes.writeNote(note);

  return res.status(200).json('upload note successfully.');
};

const readNote = async (req, res) => {
  console.log(req.params);

  // TODO: 註冊還沒寫，user_id 先寫死
  user_id = 123;
  const { note_name } = req.params;

  const result = await Notes.readNote(user_id, note_name);

  return res.status(200).json(result);
};

module.exports = {
  writeNote,
  readNote,
};
