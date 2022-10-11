const express = require('express');

const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');

require('dotenv').config();

const { MONGO_DB_URL, SESSION_SECRET, SESSION_MAXAGE } = process.env;

// [Session] ------------------------------------------------------
// session middleware
app.use(
  session({
    secret: SESSION_SECRET,
    name: 'user',
    cookie: {
      maxAge: +SESSION_MAXAGE,
    },
    saveUninitialized: false,
    resave: true,
    store: MongoStore.create({
      mongoUrl: MONGO_DB_URL,
    }),
  })
);

// parsing the incoming data
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// cookie parser middleware
app.use(cookieParser());
app.set('view engine', 'pug');
app.set('views', './server/views');
app.use(express.static('public'));
app.use(express.json());

app.use([
  require('./server/routes/user_route'),
  require('./server/routes/note_route'),
  require('./server/routes/social_route'),
]);

// error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      err.status = 400;
      err.message = '檔案超過2MB';
    }
  }
  return res.status(err.status).send({
    error: err.message,
  });
});

// 404 error
app.all('*', (req, res) => res.status(404).render('404'));

module.exports = app;
