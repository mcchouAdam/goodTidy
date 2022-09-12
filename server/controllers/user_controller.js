require('dotenv').config();
const validator = require('validator');
const User = require('../models/user_model');

const signUp = async (req, res) => {
  let { name } = req.body;
  const { email, password } = req.body;
  const userpicture = req.filename;

  if (!name || !email || !password) {
    res
      .status(400)
      .send({ error: 'Request Error: name, email and password are required.' });
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).send({ error: 'Request Error: Invalid email format' });
    return;
  }

  name = validator.escape(name);

  const result = await User.signUp(name, email, password, userpicture);
  console.log('result in user_controller signup', result);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }

  //   const user = result.user;
  //   if (!user) {
  //     res.status(500).send({ error: 'Database Query Error' });
  //     return;
  //   }

  res.status(200).send(result);
};

const nativeSignIn = async (email, password) => {
  if (!email || !password) {
    return {
      error: 'Request Error: email and password are required.',
      status: 400,
    };
  }
  try {
    return await User.nativeSignIn(email, password);
  } catch (error) {
    return { error };
  }
};

const signIn = async (req, res) => {
  const data = req.body;

  let result;
  switch (data.provider) {
    case 'native':
      result = await nativeSignIn(data.email, data.password);
      break;
    // case 'facebook':
    //   result = await facebookSignIn(data.access_token);
    //   break;
    default:
      result = { error: 'Wrong Request' };
  }

  if (result.error) {
    console.log('result.error: ', result.error);
    const status_code = result.status ? result.status : 403;
    res.status(status_code).send({ error: result.error });
    return;
  }

  // 紀錄Session登入
  const user = result.user;
  req.session.user = user;

  if (!user) {
    res.status(500).send({ error: 'Database Query Error' });
    return;
  }

  res.status(200).json({
    data: {
      access_token: user.access_token,
      access_expired: user.access_expired,
      login_at: user.login_at,
      user: {
        id: user.id,
        provider: user.provider,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    },
  });
};

const getUserProfile = async (req, res) => {
  const data = {
    id: req.session.user.id,
    provider: req.session.user.provider,
    name: req.session.user.name,
    email: req.session.user.email,
    picture: req.session.user.picture,
  };

  // console.log('profile:', data);
  res.status(200).json({ 'data': data });
  return;
};

const logOut = async (req, res) => {
  req.session.destroy();
  return res.status(200).send({ 'msg': '登出成功' });
};

module.exports = {
  signUp,
  signIn,
  logOut,
  getUserProfile,
};
