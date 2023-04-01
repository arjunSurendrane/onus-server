import Admin from '../models/adminModel.js'

export const findAdmin = async (email) => {
  return await Admin.findOne({ email })
}
