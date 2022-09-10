const express = require('express');
const app = express();

require('dotenv').config();
const port = process.env.SERVER_PORT;
const API_VERSION = process.env.API_VERSION;

app.set('view engine', 'pug');
app.set('views', './server/views');
app.use(express.static('public'));
app.use(express.json());

app.use('/api/' + API_VERSION, [require('./server/routes/user_route')]);
app.use([require('./server/routes/note_route')]);
app.use([require('./server/routes/social_route')]);

app.listen(port, () => {
  console.log(`listen ${port} sucessfully!`);
});
