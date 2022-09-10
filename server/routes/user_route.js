const router = require('express').Router();

const { wrapAsync, authentication } = require('../../utils/util');

const { userPicUpload } = require('../models/s3');
const {
  signUp,
  signIn,
  getUserProfile,
} = require('../controllers/user_controller');

const userPictureUpload = userPicUpload.fields([
  { name: 'user_pic_upload', maxCount: 1 },
]);

router.route('/user/signup').post(userPictureUpload, wrapAsync(signUp));
router.route('/user/signin').post(wrapAsync(signIn));
router.route('/user/profile').get(authentication(), wrapAsync(getUserProfile));

module.exports = router;
