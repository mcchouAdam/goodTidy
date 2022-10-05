const router = require('express').Router();
require('dotenv').config();

const { API_VERSION } = process.env;

const {
  wrapAsync,
  authentication,
  commentAuth,
  annotationAuth,
} = require('../../utils/util');

const {
  socialPage,
  createComments,
  updateComments,
  deleteComments,
  showSharedNote,
  shareNotePage,
} = require('../controllers/social_controller');

const {
  shareToAll,
  deleteShareToOther,
  getShareToAll,
  shareToOther,
  getShareToOther,
  deleteShareToAll,
  saveNote,
  updateAnnotation,
  getAnnotation,
} = require('../controllers/note_controller');

const { shareImgUpload } = require('../models/s3');

const shareImageUpload = shareImgUpload.fields([
  { name: 'share_ImgUpload', maxCount: 1 },
]);

// 社群頁面
router.route('/socialPage').get(authentication(), wrapAsync(socialPage));
// 社群筆記詳細頁面
router.route('/shareNotePage').get(authentication(), wrapAsync(shareNotePage));

// [分享] -----------------------------------------------
// 分享/取消分享 筆記給所有人
router
  .route(`/api/${API_VERSION}/note/shareToAll`)
  .post(authentication(), shareImageUpload, wrapAsync(shareToAll))
  .delete(authentication(), wrapAsync(deleteShareToAll));

// 拿取使用者分享給所有人的筆記資訊
router
  .route(`/api/${API_VERSION}/note/shareToAll/:note_id`)
  .get(authentication(), wrapAsync(getShareToAll));

// 分享/取消分享 筆記給特定人
router
  .route(`/api/${API_VERSION}/note/shareToOther`)
  .post(authentication(), wrapAsync(shareToOther))
  .delete(authentication(), wrapAsync(deleteShareToOther));

// 拿取 分享特定人權限
router
  .route(`/api/${API_VERSION}/note/shareToOther/:note_id`)
  .get(authentication(), wrapAsync(getShareToOther));

// 新增|修改|刪除 留言
router
  .route(`/api/${API_VERSION}/comment`)
  .post(authentication(), commentAuth(), wrapAsync(createComments))
  .patch(authentication(), commentAuth(), wrapAsync(updateComments))
  .delete(authentication(), commentAuth(), wrapAsync(deleteComments));

// [收藏] -----------------------------------------------------------------
router
  .route(`/api/${API_VERSION}/note/save`)
  .post(authentication(), wrapAsync(saveNote));

// [註釋] -----------------------------------------------------------------
// 註釋頁面
router
  .route('/sharedToOtherNote/:note_id')
  .get(authentication(), annotationAuth(), wrapAsync(showSharedNote));

// 新增/修改/刪除註釋權限
router
  .route(`/api/${API_VERSION}/annotation`)
  .post(authentication(), annotationAuth(), wrapAsync(updateAnnotation));

// 拿取註釋內容
router
  .route(`/api/${API_VERSION}/annotation/:note_id`)
  .get(authentication(), annotationAuth(), wrapAsync(getAnnotation));

module.exports = router;
