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
} = require('../controllers/user_controller');

const userPictureUpload = userPicUpload.fields([
  { name: 'user_pic_upload', maxCount: 1 },
]);

router
  .route(`/api/${API_VERSION}/user/signup`)
  .post(userPictureUpload, wrapAsync(signUp));
router.route(`/api/${API_VERSION}/user/signin`).post(wrapAsync(signIn));
router.route(`/api/${API_VERSION}/user/logout`).get(wrapAsync(logOut));
router
  .route(`/api/${API_VERSION}/user/profile`)
  .get(authentication(), wrapAsync(getUserProfile));
router.route(`/profile`).get(authentication(), wrapAsync(showUserProfile));

module.exports = router;
