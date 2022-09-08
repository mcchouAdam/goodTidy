const { TOKEN_SECRET } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // util from native nodejs library
const User = require('../server/models/user_model');

const wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

const authentication = () => {
  return async function (req, res, next) {
    console.log('in authentication');
    let accessToken = req.get('Authorization');
    if (!accessToken) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    accessToken = accessToken.replace('Bearer ', '');
    if (accessToken == 'null') {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    try {
      console.log(accessToken);
      const user = await promisify(jwt.verify)(accessToken, TOKEN_SECRET);
      // console.log(user);
      console.log('user in util authentication: ', user);
      req.user = user;

      let userDetail;

      userDetail = await User.getUserDetail(user.email);

      if (!userDetail) {
        res.status(403).send({ error: 'Forbidden' });
      } else {
        req.user.id = userDetail.id;
        // console.log(req.user.id)
        next();
      }

      return;
    } catch (err) {
      res.status(403).send({ error: 'Forbidden' });
      return;
    }
  };
};

module.exports = {
  wrapAsync,
  authentication,
};
