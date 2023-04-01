import User from '../models/userModel.js'
import { updateCacheMemory } from '../redis/redisFunction.js'
/**
 * Fetch All Users
 * @returns {array} -  all users
 */
export const Users = async () => {
  const data = await User.find()
  return data
}

/**
 * Update User
 * This function is used to update the user details
 * @param {String} email - user email
 * @param {Object} updatedData - updated data
 */
export const updateUser = async (email, updatedData) => {
  const data = await User.findOneAndUpdate({ email }, updatedData, {
    new: true,
  })
  updateCacheMemory(`user-${data._id}`, data)
}

/**
 * Find User With Email
 * @param {String} email - user email address
 * @returns {Object} - user details
 */
export const findUserWithEmail = async (email) => {
  return await User.findOne({ email }).select('+password')
}

/**
 * Find User Details Without Password
 * @param {String} email - user email
 * @returns {Object} - return user details
 */
export const findUserWithoutPassword = async (email) => {
  return await User.findOne({ email }).populate('memberOf.workspace')
}

/**
 * Find User
 * @param {String} email - email
 * @returns {Object} - find user details
 */
export const findUser = async (email) => {
  return await User.findOne({ email })
}

/**
 * Find User with id
 * @param {String} id - user id
 * @returns - return user details
 */
export const findUserWithId = async (id) => {
  return await User.findById(id)
}

/**
 * Update User
 * @param {String} id
 * @param {Object} updateData - update data in object
 * @returns - return Object
 */
export const updateUserDataWithId = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData)
}

/**
 * Find User Workspaces
 * @param {Object} id - user id
 * @returns {Object}
 */
export const findWorkspaces = async (id) => {
  return await User.findById(id).populate('memberOf.workspace')
}

/**
 * Find User Workspaces
 * @param {String} id
 * @returns {Object}
 */
export const userWorkspaces = async (id, limit) => {
  return await User.find({ 'memberOf.workspace': id }).skip(limit).lean()
}

/**
 * All user data from database
 * @returns {Object}
 */
export const allUsersFromDatabase = async () => {
  return await User.aggregate([
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'Assigned',
        as: 'TasksData',
      },
    },
  ])
}

/**
 * Update User role
 * @param {String} id - user id
 * @param {String} workdpaceId - workspace id
 * @param {String} role  -  user role
 * @returns {Object}
 */
export const updateRoleInUser = async (id, workdpaceId, role) => {
  return await User.findOneAndUpdate(
    {
      _id: id,
      'memberOf.workspace': workdpaceId,
    },
    { 'memberOf.$.role': role }
  )
}
