const router = require('express').Router();

require('dotenv').config();
const API_VERSION = process.env.API_VERSION;

const { wrapAsync, authentication, getNote } = require('../../utils/util');
const {
  writeNote,
  readNote,
  editNotePage,
  getUserNotes,
} = require('../controllers/note_controller');
const { upload, noteUpload } = require('../models/s3');
const { OCR_google } = require('../../utils/OCR');

const userNoteUpload = noteUpload.fields([
  { name: 'user_note_upload', maxCount: 1 },
]);

// 新增/修改筆記資料
router
  .route(`/api/${API_VERSION}/note`)
  .post(userNoteUpload, wrapAsync(writeNote));

// 使用者全部的Notes
router
  .route(`/api/${API_VERSION}/notes`)
  .get(authentication(), wrapAsync(getUserNotes));

// TODO: 加Auth
router.route(`/updateNote`).get(wrapAsync(editNotePage));
router
  .route(`/updateNote/:note_id`)
  .get(authentication(), wrapAsync(editNotePage));

// OCR
router.route(`/api/${API_VERSION}/OCR/:filename`).get(wrapAsync(OCR_google));

module.exports = router;
