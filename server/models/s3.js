const crypto = require('crypto');
const { S3Client } = require('@aws-sdk/client-s3');
const { getDefaultRoleAssumerWithWebIdentity } = require('@aws-sdk/client-sts');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const multer = require('multer'); //本來的multer設定都刪掉, 只存resquire multer
const multerS3 = require('multer-s3');

const provider = defaultProvider({
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
});

// const { AWS_ACCESS_KEY_ID, AWS_BUCKETNAME } = process.env;
const { AWS_BUCKETNAME } = process.env;

const s3 = new S3Client({
  credentialDefaultProvider: provider,
  region: 'us-east-1',
});

const OCRupload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_BUCKETNAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const customFileName = crypto
        .randomBytes(18)
        .toString('hex')
        .substr(0, 8);
      const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
      const fullName = customFileName + '.' + fileExtension;
      const picPath = 'OCR/' + fullName;
      cb(null, picPath);
      req.filename = fullName;
    },
  }),
});

const noteUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_BUCKETNAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const customFileName = crypto
        .randomBytes(18)
        .toString('hex')
        .substr(0, 8);
      const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
      const fullName = customFileName + '.' + fileExtension;
      const picPath = 'notes/' + fullName;
      cb(null, picPath);
      req.filename = fullName;
    },
  }),
});

const userPicUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_BUCKETNAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const customFileName = crypto
        .randomBytes(18)
        .toString('hex')
        .substr(0, 8);
      const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
      const fullName = customFileName + '.' + fileExtension;
      const picPath = 'user_picture/' + fullName;
      cb(null, picPath);
      req.filename = fullName;
    },
  }),
});

const shareImgUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_BUCKETNAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const customFileName = crypto
        .randomBytes(18)
        .toString('hex')
        .substr(0, 8);
      const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
      const fullName = customFileName + '.' + fileExtension;
      const picPath = 'sharing_image/' + fullName;
      cb(null, picPath);
      req.filename = fullName;
    },
  }),
});

module.exports = { OCRupload, userPicUpload, noteUpload, shareImgUpload };
