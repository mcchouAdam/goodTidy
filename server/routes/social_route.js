const router = require('express').Router();
require('dotenv').config();
const API_VERSION = process.env.API_VERSION;

const {
  wrapAsync,
  authentication,
  authorization,
} = require('../../utils/util');
const {
  socialPage,
  shareDetailPage,
  createComments,
} = require('../controllers/social_controller');

router.route('/socialPage').get(wrapAsync(socialPage));

router
  .route('/shareDetailPage')
  .get(authentication(), authorization(), wrapAsync(shareDetailPage));
router
  .route(`/api/${API_VERSION}/comments`)
  .post(authentication(), authorization(), wrapAsync(createComments));

module.exports = router;
