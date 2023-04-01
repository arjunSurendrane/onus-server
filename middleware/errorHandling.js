/**
 * Global error handling middleware
 */
export const globalErrorHandling = (err, req, res, next) => {
  console.log(err)
  if (err.status === 'fail') {
    return res.status(err.statusCode).json({
      status: 'fail',
      error: `${err}`,
    })
  } else {
    return res.status(500).json({
      status: 'error',
    })
  }
}
