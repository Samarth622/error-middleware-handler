// catchAsyncError.js
export const catchAsyncError = (thisFunction) => {
  return (req, res, next) => {
      Promise.resolve(thisFunction(req, res, next)).catch(next);
  };
};

// errorHandler.js
class ErrorHandler extends Error {
  constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      Error.captureStackTrace(this, this.constructor); // Optional: captures the stack trace
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || 'Internal Server Error';
  err.statusCode = err.statusCode || 500;

  // Handle specific error types
  if (err.name === "CastError") {
      const message = `Resource not found. Invalid ${err.path}`;
      err = new ErrorHandler(message, 400);
  }

  if (err.code === 11000) {
      const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
      err = new ErrorHandler(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
      const message = `Json web token is invalid, Try Again`;
      err = new ErrorHandler(message, 400);
  }

  if (err.name === "TokenExpiredError") {
      const message = `Json web token is expired, Try again`;
      err = new ErrorHandler(message, 400);
  }

  // Send the error response
  return res.status(err.statusCode).json({
      success: false,
      message: err.message,
  });
};

export default ErrorHandler;
