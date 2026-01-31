// handle 404 errors
// catches requests to non existence routes

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// global error handler
// cathes all error and formats response

const errorHandler = (err, req, res, next) => {
    // set status code
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    // log error in production
    if (process.env.NODE_ENV === 'production'){
        console.error('Error: ', {
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method
        });
    }
    //send error response
    res.json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? err.stack : undefined,
        errors: err.errors || undefined
    });
};

// async error wrapper
// catches errors in async route handlers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req,res,next)).catch(next);
};

module.exports = {
    notFound,
    errorHandler,
    asyncHandler
};