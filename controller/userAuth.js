import User from '../models/userModel.js'
import Jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import otpGenerator from 'otp-generator'
import Otp from '../models/otpVerification.js'
import { GenerateMail } from '../services/Nodemailer.js'
import { findUser, findUserWithEmail } from '../services/User.js'
import Workspace from '../models/workSpaceModal.js'
import catchAsync from '../utils/catchAsync.js'

// create  and send token
const successresponse = async (res, statusCode, data) => {
  const token = await Jwt.sign(
    { id: data._id, email: data.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.EXP_JWT,
    }
  )
  res.status(statusCode).json({
    status: 'success',
    data,
    token,
  })
}

// send error response
const errorResponse = async (res, statusCode, error) => {
  res.status(statusCode).json({
    status: 'fail',
    error,
  })
}

/**
 * Login controller
 * POST /user/login
 * @description - req.body have email and password
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body
  const newUser = await findUserWithEmail(email)
  if (!newUser) return errorResponse(res, 401, 'user doesnot exist')
  const comparePassword = await bcrypt.compare(password, newUser.password)
  if (!comparePassword) return errorResponse(res, 401, 'incorrect password')
  const data = {
    user: {
      name: newUser.name,
      email: newUser.email,
      _id: newUser._id,
      plan: newUser.Plan,
      block: newUser.block,
      memberOf: newUser.memberOf,
    },
    workspace: newUser.memberOf,
    _id: newUser._id,
  }
  successresponse(res, 200, data)
})

/**
 * generate otp and send to mail for email verification
 */
export const sendEmail = catchAsync(async (req, res) => {
  const { email } = req.body
  const otp = otpGenerator.generate(5, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  })
  const [Otps, user] = await Promise.all([
    Otp({ email, otp }),
    User.findOne({ email }),
  ])
  if (user) return errorResponse(res, 406, 'already have an account')
  GenerateMail(email, otp)
  res.status(200).json({
    status: 'success',
  })
  Otps.save()
})

// email otp verification
export const otpVerification = async (req, res) => {
  try {
    const { email, otp, name, password } = req.body
    const bcryptPassword = await bcrypt.hash(password, 12)
    const emailOtp = await Otp.find({ email })
    if (!emailOtp.length) return errorResponse(res, 401, 'invalid otp')
    const length = emailOtp.length
    if (!(otp == emailOtp[length - 1].otp)) {
      return errorResponse(res, 401, 'invalid otp')
    }
    const user = new User({ name, email, password: bcryptPassword })
    successresponse(res, 200, user)
    user.save()
    await Otp.deleteMany({ email })
  } catch (error) {
    errorResponse(res, 404, error)
  }
}

// forgot password
export const generateOtpForOtpLogin = async (req, res) => {
  try {
    const { email } = req.body
    const user = await findUser(email)
    if (!user) return errorResponse(res, 406, 'user not found')
    const otp = otpGenerator.generate(5, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    })
    const Otps = new Otp({ email, otp })
    GenerateMail(email, otp)
    res.status(200).json({ status: 'success' })
    Otps.save()
  } catch (error) {
    errorResponse(res, 404, `${error}`)
  }
}

// verify otp for otp login
export const verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body
    const [emailOtp, user] = await Promise.all([
      Otp.find({ email }),
      findUser(email),
    ])
    console.log(emailOtp.length)
    if (!emailOtp.length) return errorResponse(res, 401, 'invalid otp')
    const length = emailOtp.length
    console.log(otp, emailOtp[length - 1].otp)
    if (!(otp == emailOtp[length - 1].otp))
      return errorResponse(res, 401, 'invalid otp')
    successresponse(res, 200, user)
    console.log('here')
    await Otp.deleteMany({ email })
  } catch (error) {
    errorResponse(res, 404, `${error}`)
  }
}

// get user Details
export const userDetails = async (req, res) => {
  try {
    const decode = await Jwt.verify(
      req.headers.authorization.split(' ')[1],
      process.env.JWT_SECRET
    )
    const response = await Workspace.findOne({ Lead: decode.id })
    successresponse(res, 200, response)
  } catch (error) {
    errorResponse(res, 404, `${error}`)
  }
}
