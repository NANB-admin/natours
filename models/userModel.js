const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please tell use your name'],
        },
        slug: String,
        email: {
            type: String,
            required: [true, 'Please provide your email.'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valid email.']
        },
        photo: {
            type: String
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'guide', 'lead-guide'],
            default: 'user'
        },
        password: {
            type: String,
            required: [true, 'Please provide a password.'],
            minlength: 8,
            select: false
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Please confirm your password.'],
            validate: {
                // This validator only works on CREATE & SAVE !!!
                validator: function (el) {
                    return el === this.password;
                },
                message: 'Passwords do not match.'
            }
        },
        passwordChangedAt: {
            type: Date,
        },
        passwordResetToken: {
            type: String,
        },
        passwordResetExpires: {
            type: Date,
        },
        active: {
            type: Boolean,
            default: true,
            select: false
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// userSchema.virtual('durationWeeks').get(function () {
//     return this.duration / 7;
// });

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    /* Note: subtraction 1000ms from Date.now() to account for delayed incurred when saving to DB */
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre('save', async function (next) {
    // only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with salt of 12
    this.password = await bcrypt.hash(this.password, 12);

    // set passwordConfirm = undefined to prevent this field from persisting to DB.
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTImestamp) {
    // compares JWTTimestamp to token creation time and validates if user has updated their password after token was issued
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        // console.log(changedTimestamp, JWTTImestamp);
        return JWTTImestamp < changedTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    console.log({ resetToken }, this.passwordResetToken);
    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;