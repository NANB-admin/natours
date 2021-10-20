const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');


exports.setTourIdAndUserId = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}

/* generalize the getAll functionality in handlerFactory.js */
exports.getAllReviews = factory.getAll(Review);

/* generalize the getOne functionality in handlerFactory.js */
exports.getReview = factory.getOne(Review, null);

/* generalize the create functionality in handlerFactory.js */
exports.createReview = factory.createOne(Review);

/* generalize the update functionality in handlerFactory.js */
exports.updateReview = factory.updateOne(Review);

/* generalize the delete functionality in handlerFactory.js */
exports.deleteReview = factory.deleteOne(Review);
