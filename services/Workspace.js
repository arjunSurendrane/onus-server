import Workspace from '../models/workSpaceModal.js'
import { getOrSetFunction, updateCacheMemory } from '../redis/redisFunction.js'

/**
 * Get All Workspace Data
 * @returns {Array}
 */
export const findWorkspace = async (limit) => {
  try {
    const data = await getOrSetFunction('workspaces', () => {
      return Workspace.find()
        .populate('Lead')
        .populate('department.project.projectId')
    })
    return data
  } catch (error) {
    return error
  }
}

/**
 * Update Workspace
 * @param {String} id
 * @param {Object} data - updated data in object type
 * @returns {Object}
 */
export const updateWorkspace = async (id, data, session = null) => {
  const res = await Workspace.findByIdAndUpdate(id, data, {
    new: true,
    upsert: true,
    session,
  })
  updateCacheMemory(`workspace-${res._id}`, res)
  return res
}

/**
 * update nested object
 * @param {String} _id
 * @param {String} departmentID
 * @param {String} projectId
 * @returns {Object}
 */
export const updateNestedDocument = async (findData, updateData) => {
  return await Workspace.findOneAndUpdate(findData, updateData, { new: true })
}

/**
 * Get workspace data
 * @param {String} id
 * @returns {Object}
 */
export const getWorkspaceusingId = async (id) => {
  return await Workspace.findById(id)
}

/**
 * Update Plan
 * @param {String} Lead - Lead user id
 * @param {String} plan - Plan name
 * @returns
 */
export const updatePlan = async (Lead, plan) => {
  const data = await Workspace.findOneAndUpdate({ Lead }, { plan })
  return data
}
