const router = require('express').Router();

const { wrapAsync, authentication } = require('../../utils/util');
const { writeNote, readNote } = require('../controllers/note_controller');
const { upload, noteUpload } = require('../models/s3');
const { OCR_google } = require('../../utils/OCR');

const userNoteUpload = noteUpload.fields([
  { name: 'user_note_upload', maxCount: 1 },
]);

// 新增/修改筆記資料
router.route('/note').post(userNoteUpload, wrapAsync(writeNote));
router.route('/note/:note_id').get(wrapAsync(readNote));

// OCR
router.route('/OCR/:filename').get(wrapAsync(OCR_google));

module.exports = router;
