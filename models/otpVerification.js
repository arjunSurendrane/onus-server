import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'user must have an email.id'],
    lowercase: true,
  },
  otp: {
    type: Number,
  },
})

const Otp = mongoose.model('Otp', otpSchema)
export default Otp
