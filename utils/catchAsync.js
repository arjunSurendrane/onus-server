/**
 * Async Handler
 * @description - it is used to handle the errors occur in async function. it send the error to globalErrorhandling middleware
 * @param {Function} fn - function with req,res,next arguments
 * @returns {Function}
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      next(error)
    })
  }
}

export default catchAsync
