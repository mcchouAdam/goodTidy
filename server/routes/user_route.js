const router = require('express').Router();
require('dotenv').config();

const { API_VERSION } = process.env;

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
  showNotSignIn,
  showNotAuth,
} = require('../controllers/user_controller');

const {
  showUserMessage,
  deleteMessage,
} = require('../controllers/social_controller');

const userPictureUpload = userPicUpload.fields([
  {
    name: 'user_pic_upload',
    maxCount: 1,
  },
]);

// 登入
router.route(`/api/${API_VERSION}/user/signin`).post(wrapAsync(signIn));
router.route('/signin').get(wrapAsync(showSignIn));

// 未登入
router.route('/notSignIn').get(wrapAsync(showNotSignIn));
// 沒驗證
router.route('/notAuth').get(wrapAsync(showNotAuth));

// 註冊
router
  .route(`/api/${API_VERSION}/user/signup`)
  .post(userPictureUpload, wrapAsync(signUp));
router.route('/signup').get(wrapAsync(showSignUp));

// Profile
router
  .route(`/api/${API_VERSION}/user/profile`)
  .get(authentication(), wrapAsync(getUserProfile));
router.route('/profile').get(authentication(), wrapAsync(showUserProfile));

// 登出
router
  .route(`/api/${API_VERSION}/user/logout`)
  .get(authentication(), wrapAsync(logOut));

// 首頁
router.route('/').get(wrapAsync(showHome));

// USER推播通知 顯示/刪除
router
  .route(`/api/${API_VERSION}/message`)
  .get(authentication(), wrapAsync(showUserMessage))
  .delete(authentication(), wrapAsync(deleteMessage));

module.exports = router;
