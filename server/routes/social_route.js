const router = require('express').Router();
require('dotenv').config();
const API_VERSION = process.env.API_VERSION;

const {
  wrapAsync,
  authentication,
  socialComment_auth,
  annotation_auth,
} = require('../../utils/util');
const {
  socialPage,
  shareNotePage,
  createComments,
  updateComments,
  deleteComments,
  showSharedNote,
  showUserMessage,
  deleteMessage,
} = require('../controllers/social_controller');

router.route('/socialPage').get(authentication(), wrapAsync(socialPage));

// 分享Detail頁面
router.route('/shareNotePage').get(authentication(), wrapAsync(shareNotePage));

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

// 查看特定人分享的頁面
router
  .route(`/sharedToOtherNote/:note_id`)
  .get(authentication(), annotation_auth(), wrapAsync(showSharedNote));

// 更新使用者通知
router
  .route(`/api/${API_VERSION}/message`)
  .get(authentication(), wrapAsync(showUserMessage));

// 刪除使用者留言
router
  .route(`/api/${API_VERSION}/message`)
  .delete(authentication(), wrapAsync(deleteMessage));

module.exports = router;
