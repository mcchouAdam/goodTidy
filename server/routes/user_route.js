const router = require('express').Router();
require('dotenv').config();
const API_VERSION = process.env.API_VERSION;

const { wrapAsync, authentication } = require('../../utils/util');

const { userPicUpload } = require('../models/s3');
const {
  signUp,
  signIn,
  logOut,
  getUserProfile,
  showUserProfile,
  showSignIn,
  showSignUp,
  showHome,
} = require('../controllers/user_controller');

const userPictureUpload = userPicUpload.fields([
  { name: 'user_pic_upload', maxCount: 1 },
]);

router
  .route(`/api/${API_VERSION}/user/signup`)
  .post(userPictureUpload, wrapAsync(signUp));
router.route(`/api/${API_VERSION}/user/signin`).post(wrapAsync(signIn));

// Profile
router
  .route(`/api/${API_VERSION}/user/profile`)
  .get(authentication(), wrapAsync(getUserProfile));
  router.route(`/profile`).get(authentication(), wrapAsync(showUserProfile));

// 登入
router.route(`/signin`).get(wrapAsync(showSignIn));

// 登出
router
  .route(`/api/${API_VERSION}/user/logout`)
  .get(authentication(), wrapAsync(logOut));

// 註冊
router.route('/signup').get(wrapAsync(showSignUp));

// 首頁
router.route('/').get(wrapAsync(showHome));

module.exports = router;
