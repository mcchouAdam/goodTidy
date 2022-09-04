const { S3Client } = require('@aws-sdk/client-s3');
const { getDefaultRoleAssumerWithWebIdentity } = require('@aws-sdk/client-sts');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const multer = require('multer'); //本來的multer設定都刪掉, 只存resquire multer
const multerS3 = require('multer-s3');

const provider = defaultProvider({
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
});

const { AWS_ACCESS_KEY_ID, AWS_BUCKETNAME } = process.env;

const s3 = new S3Client({
  credentialDefaultProvider: provider,
  region: 'us-east-1',
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_BUCKETNAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

module.exports = upload;
