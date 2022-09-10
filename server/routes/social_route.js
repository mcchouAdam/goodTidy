const router = require('express').Router();

const { wrapAsync, authentication } = require('../../utils/util');
const {
  socialPage,
  shareDetailPage,
} = require('../controllers/social_controller');

router.route(`/socialPage`).get(wrapAsync(socialPage));
router.route(`/shareDetailPage`).get(wrapAsync(shareDetailPage));

module.exports = router;
