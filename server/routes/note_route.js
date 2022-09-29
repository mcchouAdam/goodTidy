const router = require('express').Router();

require('dotenv').config();
const API_VERSION = process.env.API_VERSION;

const {
  wrapAsync,
  authentication,
  noteAuthorization,
  annotation_auth,
} = require('../../utils/util');
const {
  showNote,
  getNote,
  createNote,
  deleteNote,
  renameNote,
  moveNote,
  renameNoteClass,
  deleteNoteClass,
  createNoteVersion,
  getUserNotes,
  shareToAll,
  deleteShareToOther,
  getShareToAll,
  shareToOther,
  getShareToOther,
  saveNote,
  updateAnnotation,
  getAnnotation,
  showUploadNote,
  deleteShareToAll,
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

// [筆記編輯頁面]
router.route(`/note`).get(authentication(), wrapAsync(showNote));

// [筆記API]
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

// 使用者全部可以看到的Notes
router
  .route(`/api/${API_VERSION}/notes`)
  .get(authentication(), noteAuthorization(), wrapAsync(getUserNotes));

// [筆記頁面]
// 編輯筆記頁面
router.route(`/note`).get(authentication(), wrapAsync(getNote));

// 上傳筆記頁面
router.route(`/uploadNote`).get(authentication(), wrapAsync(showUploadNote));

// OCR ------------------------------------------------
router
  .route(`/api/${API_VERSION}/OCR`)
  .post(OCRImgupload, wrapAsync(OCR_google));

// [分享] -----------------------------------------------
// 筆記分享給所有人
router
  .route(`/api/${API_VERSION}/note/shareToAll`)
  .post(authentication(), shareImageUpload, wrapAsync(shareToAll));

router
  .route(`/api/${API_VERSION}/note/shareToAll/:note_id`)
  .get(authentication(), wrapAsync(getShareToAll));

router
  .route(`/api/${API_VERSION}/note/shareToAll`)
  .delete(authentication(), wrapAsync(deleteShareToAll));

// 筆記分享給特定人
router
  .route(`/api/${API_VERSION}/note/shareToOther`)
  .post(authentication(), wrapAsync(shareToOther));

// 刪除筆記對特定人的分享
router
  .route(`/api/${API_VERSION}/note/shareToOther`)
  .delete(authentication(), wrapAsync(deleteShareToOther));

// 拿取分享特定人權限
router
  .route(`/api/${API_VERSION}/note/shareToOther/:note_id`)
  .get(authentication(), wrapAsync(getShareToOther));

// [收藏] -----------------------------------------------------------------
router
  .route(`/api/${API_VERSION}/note/save`)
  .post(authentication(), wrapAsync(saveNote));

// [註釋] -----------------------------------------------------------------
// 新增/修改/刪除註釋權限
router
  .route(`/api/${API_VERSION}/annotation`)
  .post(authentication(), annotation_auth(), wrapAsync(updateAnnotation));

// 拿取註釋內容
router
  .route(`/api/${API_VERSION}/annotation/:note_id`)
  .get(authentication(), annotation_auth(), wrapAsync(getAnnotation));

module.exports = router;
