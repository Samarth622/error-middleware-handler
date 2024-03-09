Error Middleware Handler
error-middleware-handler is a middleware designed to detect asynchronous errors and handle them gracefully.

Installation
You can install the package via npm:

bash
Copy code
$ npm install error-middleware-handler
Usage
First, import the necessary middleware:

javascript
Copy code
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
Then, use it in your code:

javascript
Copy code
const postJob = catchAsyncError(async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
        return next(new ErrorHandler("Job Seeker is not allowed to access these resources", 400));
    }
});
How it Works
The catchAsyncError middleware wraps asynchronous route handlers, allowing you to handle errors in a more streamlined manner. In the provided example, it catches errors thrown within the postJob handler function.

The ErrorHandler class is used to create custom error objects with a message and status code. In this case, it generates an error with the message "Job Seeker is not allowed to access these resources" and a status code of 400 (Bad Request).

License
This package is licensed under the MIT License.
