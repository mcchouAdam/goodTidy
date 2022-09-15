const router = require('express').Router();

require('dotenv').config();
const API_VERSION = process.env.API_VERSION;

const { wrapAsync, authentication } = require('../../utils/util');
const {
  createNote,
  deleteNote,
  renameNote,
  moveNote,
  renameNoteClass,
  deleteNoteClass,
  createNoteVersion,
  editNotePage,
  getUserNotes,
  shareToAll,
  getShareToAll,
  shareToOther,
  getShareToOther,
  saveNote,
} = require('../controllers/note_controller');
const { OCRupload, noteUpload, shareImgUpload } = require('../models/s3');
const { OCR_google } = require('../../utils/OCR');

const userNoteUpload = noteUpload.fields([
  { name: 'user_note_upload', maxCount: 1 },
]);

const shareImageUpload = shareImgUpload.fields([
  { name: 'share_ImgUpload', maxCount: 1 },
]);

const OCRImgupload = OCRupload.fields([{ name: 'OCR_upload', maxCount: 1 }]);

// 新增筆記
router
  .route(`/api/${API_VERSION}/note`)
  .post(userNoteUpload, wrapAsync(createNote));

// 改名筆記
router
  .route(`/api/${API_VERSION}/note`)
  .patch(authentication(), wrapAsync(renameNote));

// 搬移筆記
router
  .route(`/api/${API_VERSION}/noteClass`)
  .patch(authentication(), wrapAsync(moveNote));

// 刪除筆記
// TODO: 刪除需要auth
router
  .route(`/api/${API_VERSION}/note`)
  .delete(authentication(), wrapAsync(deleteNote));

// 改名分類
router
  .route(`/api/${API_VERSION}/noteClass`)
  .patch(authentication(), wrapAsync(renameNoteClass));

// 刪除分類
// TODO: 刪除需要auth
router
  .route(`/api/${API_VERSION}/noteClass`)
  .delete(authentication(), wrapAsync(deleteNoteClass));

// 儲存筆記
router
  .route(`/api/${API_VERSION}/noteVersion`)
  .post(wrapAsync(createNoteVersion));

// 使用者全部的Notes
router
  .route(`/api/${API_VERSION}/notes`)
  .get(authentication(), wrapAsync(getUserNotes));

// router
//   .route(`/updateNote/:note_id`)
//   .get(authentication(), wrapAsync(editNotePage));

router.route(`/updateNote`).get(authentication(), wrapAsync(editNotePage));

// OCR ------------------------------------------------
router
  .route(`/api/${API_VERSION}/OCR`)
  .post(OCRImgupload, wrapAsync(OCR_google));

// share -----------------------------------------------

// 筆記分享給所有人
router
  .route(`/api/${API_VERSION}/note/shareToAll`)
  .post(authentication(), shareImageUpload, wrapAsync(shareToAll));

router
  .route(`/api/${API_VERSION}/note/shareToAll/:note_id`)
  .get(authentication(), wrapAsync(getShareToAll));

// 筆記分享給特定人
router
  .route(`/api/${API_VERSION}/note/shareToOther`)
  .post(authentication(), wrapAsync(shareToOther));

// 拿取分享特定人權限
router
  .route(`/api/${API_VERSION}/note/shareToOther/:note_id`)
  .get(authentication(), wrapAsync(getShareToOther));

// 收藏 -----------------------------------------------------------------
router.route(`/api/${API_VERSION}/note/save`).post(wrapAsync(saveNote));

module.exports = router;
