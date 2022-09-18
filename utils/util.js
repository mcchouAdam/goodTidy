const { TOKEN_SECRET } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // util from native nodejs library
const User = require('../server/models/user_model');
const Note = require('../server/models/note_model');

const wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

const authentication = () => {
  return async function (req, res, next) {
    if (req.session.user) {
      console.log('authenticated');
      req.user = req.session.user;
      next();
    } else {
      console.log('not authenticated');
      return res.status(403).render('NotSignIn');
    }
  };
};

// 筆記的Authorization
const noteAuthorization = () => {
  return async function (req, res, next) {
    try {
      const user = req.user;
      const note_permission = await Note.getNoteAuth(user);
      req.note_permission = note_permission;
      next();

      return;
    } catch (err) {
      res.status(403).send({ error: 'Forbidden' });
      return;
    }
  };
};

// 社群的Authorization
const socialComment_auth = () => {
  return async function (req, res, next) {
    try {
      const user_email = req.session.user.email;
      const note_id = req.query.id || req.body.note_id;
      const permission_result = await Note.getSocialAuth(user_email, note_id);
      // console.log('permission_result', user_email, permission_result);

      req.permission = permission_result;
      next();

      return;
    } catch (err) {
      res.status(403).send({ error: 'Forbidden' });
      return;
    }
  };
};

// 註解的Authorization
const annotation_auth = () => {
  return async function (req, res, next) {
    try {
      const user_email = req.session.user.email;
      const note_id = req.params.note_id || req.body.note_id;
      const user_id = req.session.user._id;

      const permission_result = await Note.getAnnotationAuth(
        user_email,
        note_id,
        user_id
      );

      console.log('permission_result', permission_result);
      // 無權限
      if (permission_result == 0) {
        return res.status(403).json({ 'msg': '抱歉！您沒有權限觀看' });
      }

      // 其他權限至少可以看
      req.permission = permission_result;
      next();

      return;
    } catch (err) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
  };
};

const timeConverter = (date) => {
  dataValues = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ];
  let timeFormat = `${date.getFullYear()}/${
    date.getMonth() + 1
  }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  return timeFormat;
};

module.exports = {
  wrapAsync,
  authentication,
  noteAuthorization,
  timeConverter,
  socialComment_auth,
  annotation_auth,
};
