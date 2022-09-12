const router = require('express').Router();
require('dotenv').config();
const API_VERSION = process.env.API_VERSION;

const {
  wrapAsync,
  authentication,
  socialComment_auth,
} = require('../../utils/util');
const {
  socialPage,
  shareDetailPage,
  createComments,
} = require('../controllers/social_controller');

router.route('/socialPage').get(authentication(), wrapAsync(socialPage));

// s%3A0kJDwVS7N5VW0XILokTxarxwzcVO9RB6.4%2FhiyWc13F2D4mgvYXSYNf7aoCAOkLVVHkPESh6FYwg
// s%3Ab1VQMIqwOJmK9gwCHH31ZQGKjjNt9w7F.9mJxle42Q5VBHpcATPW90UidzKQ6FK2q7UzQzaT%2BpoE

// router
//   .route('/shareDetailPage')
//   .get(authentication(), authorization(), wrapAsync(shareDetailPage));

// router
//   .route(`/api/${API_VERSION}/comments`)
//   .post(authentication(), authorization(), wrapAsync(createComments));

router
  .route('/shareDetailPage')
  .get(authentication(), wrapAsync(shareDetailPage));

router
  .route(`/api/${API_VERSION}/comments`)
  .post(authentication(), socialComment_auth(), wrapAsync(createComments));

module.exports = router;
