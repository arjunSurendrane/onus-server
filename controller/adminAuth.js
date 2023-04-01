import Jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { findAdmin } from '../services/Admin.js'
import AppError from '../utils/appError.js'

export const adminLogin = async (req, res, next) => {
  const { email, password } = req.body
  const admin = await findAdmin(email)
  if (!admin) {
    return next(new AppError('Incorrect email or password', 401))
  }
  if (!(await bcrypt.compare(password, admin.password))) {
    return next(new AppError('Incorrect email or password', 401))
  }
  const token = await Jwt.sign({ _id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXP_JWT,
  })
  res.status(200).json({
    status: 'success',
    data: 'adminLogin Successfully',
    token,
  })
}
