const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// set mergeParams: true b/c by default - routers only have access to the params defined in their routes.
//      ex: /tours/<tour_id>/reviews -> <tour_id> is a param defined in tourRoutes, but not defined in reviewRoutes
//          - set mergeParams: true to enable reivewRoutes to have access to params defined in tourRoutes
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.route('/').get(reviewController.getAllReviews).post(authController.restrictTo('user'), reviewController.setTourIdAndUserId, reviewController.createReview);

router.route('/:id').get(reviewController.getReview).patch(authController.restrictTo('user', 'admin'), reviewController.updateReview).delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);
module.exports = router;
