require('dotenv').config();
const validator = require('validator');
const User = require('../models/user_model');

const { S3_HOST } = process.env;

// 註冊
const signUp = async (req, res) => {
  const { email, password } = req.body;
  let { name } = req.body; // name 在後面有去除特殊符號
  const userpicture = req.filename;

  if (!name || !email || !password) {
    return res.status(400).send({ error: '請填寫使用者名稱、信箱、密碼。' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).send({ error: '錯誤的Email格式' });
  }

  // if (!validator.isLength(email, { min: 0, max: 16 })) {
  //   return res.status(400).send({ error: 'Email字數最多16' });
  // }

  if (!validator.isLength(name, { min: 0, max: 16 })) {
    return res.status(400).send({ error: '名字字數最多16' });
  }

  if (!validator.isAlphanumeric(name)) {
    return res.status(400).send({ error: '名字只能是(a-z A-Z 0-9)' });
  }

  if (!validator.isLength(name, { min: 0, max: 16 })) {
    return res.status(400).send({ error: '名字字數最多16' });
  }

  if (!validator.isLength(password, { min: 3, max: 10 })) {
    return res.status(400).send({ error: '密碼字數最少3，最多10' });
  }

  name = validator.escape(name);

  const result = await User.signUp(name, email, password, userpicture);

  console.log('result in user_controller signup', result);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }

  const signIn_result = await User.nativeSignIn(email, password);

  // 紀錄Session登入
  const { user } = signIn_result;
  req.session.user = user;

  res.status(200).send(user);
};

// 登入
const signIn = async (req, res) => {
  const data = req.body;
  const { email, password } = req.body;

  if (!validator.isEmail(email)) {
    return res.status(400).send({ error: '錯誤的Email格式' });
  }

  let result;
  switch (data.provider) {
    case 'native':
      result = await nativeSignIn(email, password);
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
  const { user } = result;
  req.session.user = user;

  if (!user) {
    res.status(500).send({ error: '您沒有' });
    return;
  }

  res.status(200).json({
    data: {
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

// nativeSignIn
const nativeSignIn = async (email, password) => {
  if (!email || !password) {
    return {
      error: '請您輸入信箱與密碼',
      status: 400,
    };
  }
  try {
    return await User.nativeSignIn(email, password);
  } catch (error) {
    return { error };
  }
};

const getUserProfile = async (req, res) => {
  const data = {
    id: req.session.user.id,
    provider: req.session.user.provider,
    name: req.session.user.name,
    email: req.session.user.email,
    picture: req.session.user.picture,
  };

  return res.status(200).json({ data });
};

const showUserProfile = async (req, res) => {
  const page = 'profile';
  const { id } = req.session.user;
  const { provider } = req.session.user;
  const { name } = req.session.user;
  const { email } = req.session.user;
  if (!req.session.user.picture) {
    req.session.user.picture = 'user.png';
  }
  const picture = `${S3_HOST}/user_picture/${req.session.user.picture}`;

  return res.status(200).render('profile', {
    page,
    id,
    provider,
    name,
    email,
    picture,
  });
};

const showSignIn = async (req, res) => {
  const page = 'signin';
  if (req.session.user) {
    const { id } = req.session.user;
    const { provider } = req.session.user;
    const { name } = req.session.user;
    const { email } = req.session.user;
    if (!req.session.user.picture) {
      req.session.user.picture = 'user.png';
    }
    const picture = `${S3_HOST}/user_picture/${req.session.user.picture}`;

    return res.status(200).render('profile', {
      page,
      id,
      provider,
      name,
      email,
      picture,
    });
  }

  return res.status(200).render('signin', { page: 'signin' });
};

const showSignUp = async (req, res) => {
  const page = 'signup';
  if (req.session.user) {
    const { id } = req.session.user;
    const { provider } = req.session.user;
    const { name } = req.session.user;
    const { email } = req.session.user;
    if (!req.session.user.picture) {
      req.session.user.picture = 'user.png';
    }
    const picture = `${S3_HOST}/user_picture/${req.session.user.picture}`;

    return res.status(200).render('profile', {
      page,
      id,
      provider,
      name,
      email,
      picture,
    });
  }

  return res.status(200).render('signup', { page });
};

// 登出
const logOut = async (req, res) => {
  req.session.destroy();
  return res.status(200).send({ msg: '登出成功' });
};

// 首頁
const showHome = async (req, res) => {
  const page = 'Home';
  if (req.session.user) {
    const { id } = req.session.user;
    const { provider } = req.session.user;
    const { name } = req.session.user;
    const { email } = req.session.user;
    const picture = `${S3_HOST}/user_picture/${req.session.user.picture}`;

    return res.status(200).render('Home', {
      page,
      id,
      provider,
      name,
      email,
      picture,
    });
  }

  return res.status(200).render('Home', { page });
};

module.exports = {
  signUp,
  signIn,
  logOut,
  getUserProfile,
  showUserProfile,
  showSignIn,
  showSignUp,
  showHome,
};
