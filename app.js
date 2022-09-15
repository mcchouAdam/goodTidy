const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();
const { MONGO_DB_URL } = process.env;

// [Session] ------------------------------------------------------
// creating 24 hours from milliseconds
const sevenDay = 1000 * 60 * 60 * 24 * 7;

//session middleware
app.use(
  session({
    secret: '123qweasdzxc',
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

app.use('/api/' + API_VERSION, [require('./server/routes/user_route')]);
app.use([require('./server/routes/note_route')]);
app.use([require('./server/routes/social_route')]);

// HomePage
app.get('/', async (req, res) => {
  return res.render('homePage');
});

// Index
app.get('/index', async (req, res) => {
  return res.render('index');
});

app.listen(port, () => {
  console.log(`listen ${port} sucessfully!`);
});
