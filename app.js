const express = require('express');
const app = express();
const path = require('path');
const { readNote } = require('./server/models/note_model');
const { authentication } = require('./utils/util');

require('dotenv').config();
const port = process.env.SERVER_PORT;
const API_VERSION = process.env.API_VERSION;

// TODO: change the pug path
app.set('view engine', 'pug');
app.set('views', './server/views');
app.use(express.static('public'));
app.use(express.json());

app.use('/api/' + API_VERSION, [require('./server/routes/user_route')]);
app.use([require('./server/routes/note_route')]);

app.get('/createNote', (req, res) => {
  res.render('createNote');
});

// http://localhost:3000/updateNote/6319c15fe996d4c3a8d20340

app.listen(port, () => {
  console.log(`listen ${port} sucessfully!`);
});
