const router = require('express').Router();
require('dotenv').config();
const API_VERSION = process.env.API_VERSION;

const {
  wrapAsync,
  authentication,
  socialComment_auth,
} = require('../../utils/util');
const {
  socialPage,
  shareDetailPage,
  createComments,
  updateComments,
  deleteComments,
} = require('../controllers/social_controller');

router.route('/socialPage').get(authentication(), wrapAsync(socialPage));

// 分享Detail頁面
router
  .route('/shareDetailPage')
  .get(authentication(), wrapAsync(shareDetailPage));

// 新增留言
router
  .route(`/api/${API_VERSION}/comment`)
  .post(authentication(), socialComment_auth(), wrapAsync(createComments));

// 修改留言
router
  .route(`/api/${API_VERSION}/comment`)
  .patch(authentication(), socialComment_auth(), wrapAsync(updateComments));

// 刪除留言
router
  .route(`/api/${API_VERSION}/comment`)
  .delete(authentication(), socialComment_auth(), wrapAsync(deleteComments));

module.exports = router;
