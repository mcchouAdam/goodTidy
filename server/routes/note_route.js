const router = require('express').Router();

const { wrapAsync } = require('../../utils/util');
const { writeNote, readNote } = require('../controllers/note_controller');
const { upload } = require('../models/s3');
const { OCR_google } = require('../../utils/OCR');

// 新增/修改筆記資料
router.route('/note').post(wrapAsync(writeNote));
router.route('/note/:note_name').get(wrapAsync(readNote));

// OCR
router.route('/OCR/:filename').get(wrapAsync(OCR_google));

module.exports = router;
