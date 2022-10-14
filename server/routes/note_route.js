const router = require('express').Router();

require('dotenv').config();

const { API_VERSION } = process.env;

const {
  wrapAsync,
  authentication,
  noteAuthorization,
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
  showUploadNote,
} = require('../controllers/note_controller');
const { OCRupload, noteUpload } = require('../models/s3');
const { getOCR } = require('../../utils/OCR');

const userNoteUpload = noteUpload.fields([
  { name: 'user_note_upload', maxCount: 1 },
]);

const OCRImgupload = OCRupload.fields([{ name: 'OCR_upload', maxCount: 1 }]);

// [筆記編輯頁面]
router.route('/note').get(authentication(), wrapAsync(showNote));

// [筆記API]
// [筆記] 新增/改名/刪除
router
  .route(`/api/${API_VERSION}/note`)
  .post(userNoteUpload, wrapAsync(createNote))
  .patch(authentication(), wrapAsync(renameNote))
  .delete(authentication(), wrapAsync(deleteNote));

// [筆記] 儲存版本
router
  .route(`/api/${API_VERSION}/noteVersion`)
  .post(wrapAsync(createNoteVersion));

// [筆記] 拿取使用者權限允許的筆記
router
  .route(`/api/${API_VERSION}/notes`)
  .get(authentication(), noteAuthorization(), wrapAsync(getUserNotes));

// [筆記分類] 改名/刪除/搬移
router
  .route(`/api/${API_VERSION}/noteClass`)
  .patch(authentication(), wrapAsync(renameNoteClass))
  .delete(authentication(), wrapAsync(deleteNoteClass))
  .patch(authentication(), wrapAsync(moveNote));

// [筆記頁面]
// 編輯筆記頁面
router.route('/note').get(authentication(), wrapAsync(getNote));

// 上傳筆記頁面
router.route('/uploadNote').get(authentication(), wrapAsync(showUploadNote));

// OCR ------------------------------------------------
router.route(`/api/${API_VERSION}/OCR`).post(OCRImgupload, wrapAsync(getOCR));

module.exports = router;
