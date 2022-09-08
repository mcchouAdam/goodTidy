const express = require('express');
const app = express();
const path = require('path');

require('dotenv').config();
const port = process.env.SERVER_PORT;
const API_VERSION = process.env.API_VERSION;

// TODO: change the pug path
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.json());

app.use('/api/' + API_VERSION, [
  require('./server/routes/note_route'),
  require('./server/routes/user_route'),
]);

// app.get('/createNote', (req, res) => {
//   res.sendFile(path.join(__dirname, './public', 'createNote.html'));
// });

// app.get('/updateNote', (req, res) => {
//   res.sendFile(path.join(__dirname, './public', 'updateNote.html'));
// });

app.get('/createNote', (req, res) => {
  res.render('createNote');
});

app.get('/updateNote/:node_id', (req, res) => {
  // console.log(req.params);
  res.render('updateNote');
});

app.listen(port, () => {
  console.log(`listen ${port} sucessfully!`);
});
