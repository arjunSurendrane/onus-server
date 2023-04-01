import mongoose from 'mongoose'

/**
 * Connect to database
 */
const connectToDB = () => {
  // connected to database
  mongoose.set('strictQuery', true)
  const db = process.env.MONGODB_KEY.replace('<password>', process.env.PASSWORD)
  // const db = 'mongodb://localhost:27017/workload-management-system'
  mongoose
    .connect(db)
    .then((res) => {
      console.log('connected to database')
    })
    .catch((err) => {
      console.log('database not connected ' + err)
    })
}

export default connectToDB
