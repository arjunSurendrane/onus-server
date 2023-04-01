import S3 from 'aws-sdk/clients/s3.js'
import fs from 'fs'

/**
 * Set AWS S3 credentials
 * @returns {Object}
 */
const credentials = () => {
  const bucketName = process.env.AWS_BUCKET_NAME
  const region = process.env.AWS_BUCKET_REGION
  const accessKeyId = process.env.AWS_BUCKET_ACCESS_KEY
  const secretAccessKey = process.env.AWS_BUCKET_SECRET_KEY
  const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey,
  })
  return { bucketName, s3 }
}

/**
 * Upload file
 * @description - Upload file into AWS s3
 * @param {Object} file
 * @returns
 */
export const uploadFile = async (file) => {
  const fileStream = fs.createReadStream(file.path)
  const { bucketName, s3 } = credentials()
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  }
  const uploadFile = s3.upload(uploadParams).promise()
  return uploadFile
}

/**
 * Get data from AWS s3
 * @param {String} fileKey
 * @returns
 */
export const getFileStream = (fileKey) => {
  const { bucketName, s3 } = credentials()
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  }
  return s3.getObject(downloadParams).createReadStream()
}
