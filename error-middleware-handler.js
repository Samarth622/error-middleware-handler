// error-middleware-handler.js

/**
 * Catch asynchronous errors in Express routes.
 * @param {Function} thisFunction - The async function to be wrapped.
 * @returns {Function} Middleware function that catches errors.
 */
export const catchAsyncError = (thisFunction) => {
    return (req, res, next) => {
      Promise.resolve(thisFunction(req, res, next)).catch(next);
    };
  };// errorMiddleware.test.js

  const request = require('supertest');
  const express = require('express');
  const { catchAsyncError, errorMiddleware } = require('./error-middleware-handler'); // Adjust path as necessary
  const ErrorHandler = require('./error-middleware-handler').default; // Ensure the path matches your file structure
  
  // Helper function to create a new Express app for each test
  function createTestApp() {
    const app = express();
  
    // Mock function to test error handling
    function errorGive() {
      const post = catchAsyncError(async (req, res, next) => {
        if (req.user === 'student') {
          return next(new ErrorHandler('Student not access this page', 400));
        }
        res.sendStatus(200); // Proceed if no error is thrown
      });
  
      // Creating a route to test the middleware
      app.use(
        '/test',
        (req, res, next) => {
          req.user = 'student'; // Simulate the user being a student
          next();
        },
        post
      );
  
      // Error handling middleware should be added after routes
      app.use(errorMiddleware);
    }
  
    // Call the function to set up routes and middleware
    errorGive();
  
    return app;
  }
  
  // Tests
  describe('Error Handling Middleware', () => {
    it('should return 400 when user is a student', async () => {
      const app = createTestApp(); // Create a fresh app instance
      const response = await request(app).get('/test');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Student not access this page');
    });
  
    it('should return 200 for non-student users', async () => {
      const app = express(); // Create a new instance of Express
      app.use(
        '/test-non-student',
        (req, res, next) => {
          req.user = 'admin'; // Simulate a non-student user
          next();
        },
        catchAsyncError(async (req, res) => {
          res.sendStatus(200); // Respond with 200 OK if no error
        })
      );
      app.use(errorMiddleware); // Ensure the error middleware is added
  
      const response = await request(app).get('/test-non-student');
      expect(response.status).toBe(200);
    });
  });
  
  
  /**
   * Custom error class for handling application errors.
   */
  class ErrorHandler extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Express middleware to handle errors.
   * @param {Error} err - The error object.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Next middleware function.
   */
  export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || 'Internal Server Error';
    err.statusCode = err.statusCode || 500;
  
    const errorTypes = {
      CastError: () => new ErrorHandler(`Resource not found. Invalid ${err.path}`, 400),
      11000: () => new ErrorHandler(`Duplicate ${Object.keys(err.keyValue)} entered`, 400),
      JsonWebTokenError: () => new ErrorHandler(`JSON web token is invalid, try again`, 400),
      TokenExpiredError: () => new ErrorHandler(`JSON web token has expired, try again`, 400),
    };
  
    if (errorTypes[err.name] || errorTypes[err.code]) {
      err = errorTypes[err.name] ? errorTypes[err.name]() : errorTypes[err.code]();
    }
  
    // Send the error response
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  };
  
  export default ErrorHandler;
  