const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}


exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                // _id: '$ratingsAverage',
                _id: { $toUpper: '$difficulty' },
                // add 1 to 'numTours' for every document returned in group
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            }
        },
        {
            $sort: {
                avgPrice: 1
            }
        },
        // {
        //     $match: {
        //         _id: { $ne: 'EASY' }
        //     }
        // }
    ]);
    res.status(200).json({
        status: 'success',
        data: stats
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: plan
    });
});



/* generalize the update functionality in handlerFactory.js */
exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//     const apiFeatures = new APIFeatures(Tour.find(), req.query);
//     apiFeatures.query = Tour.find();
//     apiFeatures.queryString = req.query;
//     // EXECUTE QUERY
//     // const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
//     const features = apiFeatures
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();
//     const tours = await features.query;
//     // SEND RESPONSE
//     res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         data: {
//             tours
//         }
//     });
// });



/* generalize the update functionality in handlerFactory.js */
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404));
//     }
//     res.status(200).json({
//         status: "success",
//         data: {
//             tour
//         }
//     });
// });



/* generalize the update functionality in handlerFactory.js */
exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//         status: "success",
//         data: {
//             tour: newTour
//         }
//     });
// });



/* generalize the update functionality in handlerFactory.js */
exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     }, () => next(new AppError('No tour found with that ID', 404)));

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     });
// });



/* generalize the delete functionality in handlerFactory.js */
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//     await Tour.findByIdAndDelete(req.params.id, () => next(new AppError('No tour found with that ID', 404)));
//     res.status(204).json({
//         status: 'success',
//         data: null
//     });
// });


exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3962.2 : distance / 6378.1;
    // console.log(radius, lat, lng, distance, unit);
    if (!lat || !lng) {
        return next(new AppError('Please provide latitude and longitude in the format: lat,lng'));
    }

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    // console.log(radius, lat, lng, distance, unit);
    if (!lat || !lng) {
        return next(new AppError('Please provide latitude and longitude in the format: lat,lng'));
    }

    const distances = await Tour.aggregate([
        {
            // note: $geoNear must be first argument in aggregation pipeline (if $geoNear is being used)
            //      - and $geoNear requires an element with a geospatial index
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
});