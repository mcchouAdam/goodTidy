const { Mongo } = require('./mongocon');
require('dotenv').config();
const { MONGO_DB } = process.env;

const writeNote = async (note) => {
  try {
    await Mongo.connect();
    const NotesCollection = Mongo.db(MONGO_DB).collection('notes');
    console.log('note:', note);
    // let note = {
    //   'note_id': 1,
    //   'user_id': 123,
    //   'note_name': '無敵炫砲筆記',
    //   'shapes': [
    //     `<div id="font-pick-0" class="font-pick" style="background-image: url('https://goodtidy.s3.amazonaws.com/no-bg_small.png'); width: 600px; height: 300px; clip-path: polygon(54% 26%, 54% 37%, 61% 37%, 62% 28%); position: absolute; top: 536px; left: 153px;"></div>`,
    //     `<div id="magic-pick-2" class="magic-pick" style="background-image: url('https://goodtidy.s3.amazonaws.com/no-bg_small.png'); width: 600px; height: 300px; clip-path: polygon(47% 25%, 46% 46%, 54% 48%, 55% 26%); position: absolute; top: 436px; left: -121px;"></div>`,
    //     `<div id="magic-pick-1" class="magic-pick" style="background-image: url('https://goodtidy.s3.amazonaws.com/no-bg_small.png'); width: 600px; height: 300px; clip-path: polygon(30% 23%, 30% 44%, 40% 44%, 39% 24%); position: absolute; top: 473px; left: -81px;"></div>`,
    //     `<div id="magic-pick-0" class="magic-pick" style="background-image: url('https://goodtidy.s3.amazonaws.com/no-bg_small.png'); width: 600px; height: 300px; clip-path: polygon(19% 23%, 11% 43%, 24% 45%); position: absolute; top: 415px; left: 15px;"></div>`,
    //   ],
    //   'fonts': [
    //     {
    //       'description': 'O\nAdam',
    //       'coordinate': [
    //         { x: 276, y: 78 },
    //         { x: 326, y: 76 },
    //         { x: 328, y: 122 },
    //         { x: 278, y: 125 },
    //       ],
    //     },
    //     {
    //       'description': 'O',
    //       'coordinate': [
    //         { x: 276, y: 78 },
    //         { x: 326, y: 76 },
    //         { x: 328, y: 122 },
    //         { x: 278, y: 125 },
    //       ],
    //     },
    //     {
    //       'description': 'Adam',
    //       'coordinate': [
    //         { x: 332, y: 78 },
    //         { x: 369, y: 79 },
    //         { x: 368, y: 100 },
    //         { x: 331, y: 99 },
    //       ],
    //     },
    //   ],
    // };
    const result = await NotesCollection.insertOne(note);

    return result;
  } catch (error) {
    return { error };
  } finally {
    await Mongo.close();
  }
};

const readNote = async (user_id, note_name) => {
  try {
    await Mongo.connect();
    const NotesCollection = Mongo.db(MONGO_DB).collection('notes');

    const result = await NotesCollection.find({
      'user_id': user_id,
      'note_name': note_name,
    }).toArray();

    // console.log(result);
    return result;
  } catch (error) {
    return { error };
  } finally {
    await Mongo.close();
  }
};

module.exports = {
  writeNote,
  readNote,
};
