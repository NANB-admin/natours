const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

/* for logged in user to update their own user data */
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates.  Please use /updateMyPassword', 400));
    }

    // 2) Filtered out unwanted field names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

    // 3) Update user document
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null
    });
});

/* create user functionality done on signup */
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead.'
    })
};


/* generalize the getAll functionality in handlerFactory.js */
exports.getAllUsers = factory.getAll(User);

/* generalize the getOne functionality in handlerFactory.js */
exports.getUser = factory.getOne(User, null);

// Do NOT update passwords with this!
/* generalize the update functionality in handlerFactory.js */
exports.updateUser = factory.updateOne(User);

/* generalize the delete functionality in handlerFactory.js */
exports.deleteUser = factory.deleteOne(User);
