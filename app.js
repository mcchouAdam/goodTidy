const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();
const { MONGO_DB_URL, SESSION_SECRET } = process.env;

// [Session] ------------------------------------------------------
// creating 24 hours from milliseconds
const sevenDay = 1000 * 60 * 60 * 24 * 7;

//session middleware
app.use(
  session({
    secret: SESSION_SECRET,
    name: 'user',
    cookie: { maxAge: sevenDay },
    saveUninitialized: false,
    resave: true,
    store: MongoStore.create({ mongoUrl: MONGO_DB_URL }),
  })
);

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie parser middleware
app.use(cookieParser());

require('dotenv').config();
const port = process.env.SERVER_PORT;
const API_VERSION = process.env.API_VERSION;

app.set('view engine', 'pug');
app.set('views', './server/views');
app.use(express.static('public'));
app.use(express.json());

app.use([
  require('./server/routes/user_route'),
  require('./server/routes/note_route'),
  require('./server/routes/social_route'),
]);

// HomePage
app.get('/', async (req, res) => {
  return res.render('homePage');
});

// Index
app.get('/notes', async (req, res) => {
  return res.render('notes');
});

// TODO: 搬家
// signup
app.get('/signup', async (req, res) => {
  return res.render('signup');
});

// // uploadNote
// app.get('/uploadNote', async (req, res) => {
//   return res.render('uploadNote');
// });

// sharedNote
app.get('/sharedNote/:note_id', async (req, res) => {
  return res.render('sharedNote');
});

// error handling
app.use((err, req, res, next) => {
  // console.error(err.stack)
  res.status(404).render('404');
});

app.listen(port, () => {
  console.log(`listen ${port} sucessfully!`);
});
