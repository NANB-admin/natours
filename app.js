const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


// (1) GLOBAL MIDDLEWARE
// used to serve static files in app
app.use(express.static(path.join(__dirname, 'public')));

// Set Security HTTP headers - https://github.com/helmetjs/helmet
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit max # of request from same API within timespan
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});

// apply rateLimiter on all routes starting with /api i.e. all routes
app.use('/api', limiter);


// Body parser, reading data from body into req.body
//  - limit req.body size to 10kb
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
/*
ex (when package not in use): send login request with req.body as: { "email": {"$gt":""}, "password":"password" }
*/
app.use(mongoSanitize());

// Data sanitization against XSS
/* ex: posting data with html tags as values - ex: { "name": <div id="bad-data"></div> 
            - when data is saved to DB it will be saved as non-harmful conversions of data            
*/
app.use(xssClean());

// Prevent parameter polution
/* ex: send get req with multiple identical path parameters: {{URL}}/api/v1/tours?sort=duration&sort=price */
// white list certain paramters where we want to allow duplicate parameters within query string - ex: {{URL}}/api/v1/tours?duration=5&duration=9
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));


// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    // console.log(req.cookies);
    next();
});

// (2) ROUTE HANDLERS


// (3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// catch all unhandled routes -
//      - if req reaches this piece in code - then req. has not been resolved by above handlers.
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;