import mongoose from 'mongoose'
import Task from '../models/taskModal.js'
import {
  deleteCache,
  getOrSetFunction,
  updateCacheMemory,
} from '../redis/redisFunction.js'

/**
 * Aggregate Task data with 4 pipeline
 * used by user
 * @param {Object} param0
 * @returns {Object}
 */
export const taskAggregateWith4PipeLine = async ({
  matchData,
  lookupData,
  projectData,
  groupData,
}) => {
  return await Task.aggregate([
    {
      $match: matchData,
    },
    {
      $lookup: lookupData,
    },
    {
      $project: projectData,
    },
    {
      $group: groupData,
    },
  ])
}

/**
 * Get Task
 * @param {String} id - task id
 * @returns {Object} - task data
 */
export const getTask = async (id) => {
  const data = await Task.findById(id).lean()
  return data
}

/**
 * Update Task
 * @param {String} id - task id
 * @param {Object} data - Updated data in object format
 * @returns {Object} - Task data get from mongodb
 */
export const updateTask = async (id, data, userid) => {
  const update = {
    updatedBy: userid,
    updateTime: new Date(Date.now()),
  }
  const task = await Task.findByIdAndUpdate(
    id,
    { ...data, update },
    {
      new: true,
      lean: true,
      upsert: true,
    }
  )
  deleteCache(`groupedTask-${task.projectID._id}`)
  updateCacheMemory(`task-${id}`, task)
  return task
}

/**
 * Delete Task
 * @param {String} id - Task id
 * @returns {Object} - deleted task
 */
export const deleteTaskUsingId = async (id) => {
  const data = await Task.findByIdAndDelete(id)
  deleteCache(`task-${id}`)
  deleteCache(`groupedTask-${data.projectID._id}`)
  return data
}

/**
 * Get Grouped Task Data
 * used by user
 * @param {String} id - user id
 * @returns {Object} - return task data
 */
export const aggregateData = async ({ matchData, groupData }) => {
  return await Task.aggregate([
    {
      $match: matchData,
    },
    {
      $group: groupData,
    },
  ])
}

/**
 * it return workspace workload data with its assigned users and therir workload count
 */
export const workspaceWorkloadWithAssignedUsers = async (workspaceId) => {
  return await Task.aggregate([
    {
      $match: {
        workspaceId: mongoose.Types.ObjectId(`${workspaceId}`),
        status: { $ne: 'Completed' },
        Assigned: { $ne: null },
      },
    },
    {
      $group: {
        _id: '$Assigned',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $project: {
        _id: 1,
        count: 1,
        'user.name': 1,
        'user.email': 1,
      },
    },
  ])
}

/**
 * Delete Task With Project id
 * @param {String} projectID
 * @returns {Object}
 */
export const deleteTaskWithProjectid = async (projectID, session) => {
  return await Task.findOneAndDelete({ projectID }, { session })
}
