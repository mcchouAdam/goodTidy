const { S3Client } = require('@aws-sdk/client-s3');

const { AWS_ACCESS_KEY_ID, AWS_BUCKETNAME, AWS_ACCESSKEY, AWS_REGION } =
  process.env;
const multer = require('multer'); // 本來的multer設定都刪掉, 只存resquire multer
const multerS3 = require('multer-s3');
const path = require('path');
const crypto = require('crypto');

const s3 = new S3Client({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_ACCESSKEY,
  region: AWS_REGION,
  signatureVersion: 'v4',
  s3ForcePathStyle: true,
});

const OCRupload = multer({
  storage: multerS3({
    s3,
    bucket: AWS_BUCKETNAME,
    metadata(req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
      });
    },
    key(req, file, cb) {
      const customFileName = crypto
        .randomBytes(18)
        .toString('hex')
        .substr(0, 8);
      const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
      const fullName = `${customFileName}.${fileExtension}`;
      const picPath = `OCR/${fullName}`;
      cb(null, picPath);
      req.filename = fullName;
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 2,
  }, // 2MB
  fileFilter(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    const err = new Error('請您上傳jpeg, jpg, png檔');
    err.status = 400;
    return cb(err, false);
  },
});

const noteUpload = multer({
  storage: multerS3({
    s3,
    bucket: AWS_BUCKETNAME,
    metadata(req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
      });
    },
    key(req, file, cb) {
      const customFileName = crypto
        .randomBytes(18)
        .toString('hex')
        .substr(0, 8);
      const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
      const fullName = `${customFileName}.${fileExtension}`;
      const picPath = `notes/${fullName}`;
      cb(null, picPath);
      req.filename = fullName;
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 2,
  }, // 2MB
  fileFilter(req, file, cb) {
    const filetypes = /jpeg|jpg|png|/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    const err = new Error('請您上傳jpeg, jpg, png檔');
    err.status = 400;
    return cb(err, false);
  },
});

const userPicUpload = multer({
  storage: multerS3({
    s3,
    bucket: AWS_BUCKETNAME,
    metadata(req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
      });
    },
    key(req, file, cb) {
      const customFileName = crypto
        .randomBytes(18)
        .toString('hex')
        .substr(0, 8);
      const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
      const fullName = `${customFileName}.${fileExtension}`;
      const picPath = `user_picture/${fullName}`;
      cb(null, picPath);
      req.filename = fullName;
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 2,
  }, // 2MB
  fileFilter(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    const err = new Error('請您上傳jpeg, jpg, png檔');
    err.status = 400;
    return cb(err, false);
  },
});

const shareImgUpload = multer({
  storage: multerS3({
    s3,
    bucket: AWS_BUCKETNAME,
    metadata(req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
      });
    },
    key(req, file, cb) {
      const customFileName = crypto
        .randomBytes(18)
        .toString('hex')
        .substr(0, 8);
      const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
      const fullName = `${customFileName}.${fileExtension}`;
      const picPath = `sharing_image/${fullName}`;
      cb(null, picPath);
      req.filename = fullName;
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 2,
  }, // 2MB
  fileFilter(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    const err = new Error('請您上傳jpeg, jpg, png檔');
    err.status = 400;
    return cb(err, false);
  },
});

module.exports = {
  OCRupload,
  userPicUpload,
  noteUpload,
  shareImgUpload,
};
