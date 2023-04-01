/**
 * Global Response
 * @param {Object} res - response
 * @param {Number} statusCode - status code for response
 * @param {Object} data - response data in object format || sometime it have more than one data so send it in a object
 */
export const response = (res, statusCode, data) => {
  res.status(statusCode).json({
    status: 'success',
    data,
  })
}
