const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review cannot be empty!'],
        },
        rating: {
            type: Number,
            required: [true, 'A review must have a rating'],
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour.']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must have an author.']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// ---------------------
// QUERY MIDDLEWARE
// ---------------------
reviewSchema.pre(/^find/, function (next) {
    this
        .populate({
            path: 'user',
            select: 'name photo'
        })
        // .populate({
        //     path: 'tour',
        //     select: 'name'
        // })
        ;

    next();
});


reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const statistics = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }

            }
        }
    ]);
    // console.log(statistics);

    if (statistics.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: statistics[0].nRating,
            ratingsAverage: statistics[0].avgRating
        });
    };
};

reviewSchema.post('save', function (next) {
    // this points to current review.
    this.constructor.calcAverageRatings(this.tour);
});

/*
    want QueryMiddleware to execute for both: findByIdAndUpdate & findByIdAndDelete
     - using regEx: /^findOneAnd.../

     use this 'pre' middleware to get the tourId that will need to be passed to calcAverageRatings(tourId)...
        assign tourId to this.review (internal variable so that post QueryMiddleware can access tourId)
*/
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.review = await this.findOne();
    // console.log(review);
    next();
});

/*
    - retrieve tourId from defined in pre QueryMiddleware (above)
        - pass tourId to calcAverageRatings(tourId).
*/
reviewSchema.post(/^findOneAnd/, async function (next) {
    await this.review.constructor.calcAverageRatings(this.review.tour);
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
