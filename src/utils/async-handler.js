//Higher order function since it takes a function as an argument and returns a function
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
        .resolve(requestHandler(req, res, next))
        .catch((error) => next(error)); //Pass errors to Express error handling middleware
    }
}

export {asyncHandler}