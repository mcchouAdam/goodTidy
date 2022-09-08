const Notes = require('../models/note_model');

const writeNote = async (req, res) => {
  const note = req.body;
  const result = await Notes.writeNote(note);

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

module.exports = {
  writeNote,
  readNote,
};
