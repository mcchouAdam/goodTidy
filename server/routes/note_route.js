const router = require('express').Router();

require('dotenv').config();
const API_VERSION = process.env.API_VERSION;

const { wrapAsync, authentication } = require('../../utils/util');
const {
  createNote,
  createNoteVersion,
  editNotePage,
  createNotePage,
  getUserNotes,
  shareToAll,
  shareToOther,
  getShareToOther,
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

// TODO: 兩個都要加Auth
router.route(`/updateNote`).get(wrapAsync(editNotePage));
router.route(`/createNote`).get(wrapAsync(createNotePage));

// OCR ------------------------------------------------
router
  .route(`/api/${API_VERSION}/OCR`)
  .post(OCRImgupload, wrapAsync(OCR_google));

// share -----------------------------------------------

// 筆記分享給所有人
router
  .route(`/api/${API_VERSION}/note/shareToAll`)
  .post(authentication(), shareImageUpload, wrapAsync(shareToAll));

// 筆記分享給特定人
router
  .route(`/api/${API_VERSION}/note/shareToOther`)
  .post(authentication(), wrapAsync(shareToOther));

// 拿取分享特定人權限
router
  .route(`/api/${API_VERSION}/note/shareToOther/:note_id`)
  .get(authentication(), wrapAsync(getShareToOther));

module.exports = router;
