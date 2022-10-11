const Note = require('../server/models/note_model');
const { authorizationList } = require('./authorization');

const wrapAsync = (fn) =>
  function (req, res, next) {
    fn(req, res, next).catch(next);
  };

const authentication = () =>
  async function (req, res, next) {
    if (req.session.user) {
      console.log('authenticated');
      req.user = req.session.user;
      next();
    } else {
      console.log('not authenticated');
      return res.status(403).redirect('/notSignIn');
    }
  };

// 筆記的Authorization
const noteAuthorization = () =>
  async function (req, res, next) {
    try {
      const { user } = req;
      const note_permission = await Note.getNoteAuth(user);
      req.note_permission = note_permission;
      next();

      return;
    } catch (err) {
      console.log('Forbidden');
      return res.status(403).redirect('/notAuth');
    }
  };

// 社群的Authorization
const commentAuth = () =>
  async function (req, res, next) {
    try {
      const user_email = req.session.user.email;
      const note_id = req.query.id || req.body.note_id;
      const permission_result = await Note.getSocialAuth(user_email, note_id);
      // console.log('permission_result', user_email, permission_result);

      req.permission = permission_result;
      next();

      return;
    } catch (err) {
      console.log('Forbidden');
      return res.status(403).redirect('/notAuth');
    }
  };

// 註解的Authorization
const annotationAuth = () =>
  async function (req, res, next) {
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
      if (permission_result === authorizationList.forbidden) {
        console.log('Forbidden');
        return res.status(403).redirect('/notAuth');
      }

      // 其他權限至少可以看
      req.permission = permission_result;
      next();

      return;
    } catch (err) {
      console.log('Forbidden');
      return res.status(403).redirect('/notAuth');
    }
  };

const timeConverter = (date) => {
  const year = date.getFullYear().toString();
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();
  let hours = date.getHours().toString();
  let minute = date.getMinutes().toString();
  let second = date.getSeconds().toString();

  // 補零
  if (day.length === 1) {
    day = `0${day}`;
  }
  if (month.length === 1) {
    month = `0${month}`;
  }
  if (hours.length === 1) {
    hours = `0${hours}`;
  }
  if (minute.length === 1) {
    minute = `0${minute}`;
  }
  if (second.length === 1) {
    second = `0${second}`;
  }

  const timeFormat = `${year}/${month}/${day} - ${hours}:${minute}:${second}`;

  return timeFormat;
};

module.exports = {
  wrapAsync,
  authentication,
  noteAuthorization,
  timeConverter,
  commentAuth,
  annotationAuth,
};
