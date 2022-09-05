const express = require('express');
const app = express();

require('dotenv').config();
const port = process.env.SERVER_PORT;
const API_VERSION = process.env.API_VERSION;

// const { OCR_google } = require('./utils/OCR');

multer = require('multer');
const upload = require('./server/models/s3');

// TODO: change the pug path
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.json());

app.use('/api/' + API_VERSION, [require('./server/routes/note_route')]);

app.get('/createNote.html', (req, res) => {
  res.send(path.join(public, 'createNote.html'));
});

app.get('/createNote', (req, res) => {
  res.render('createNote');
});

// TODO: upload 抽成中間鍵
app.post(
  '/upload/file',
  upload.array('upload_file', 3),
  function (req, res, next) {
    res.send('Successfully uploaded ' + req.files.length + ' files!');
  }
);

app.listen(port, () => {
  console.log(`listen ${port} sucessfully!`);
});
