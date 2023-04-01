import mongoose from 'mongoose'
import { findUserActivity } from '../services/notification.js'
import { taskAggregateWith4PipeLine, aggregateData } from '../services/Task.js'
import {
  allUsersFromDatabase,
  findUserWithId,
  findWorkspaces,
  updateUserDataWithId,
} from '../services/User.js'
import catchAsync from '../utils/catchAsync.js'
import { findNotifications } from './notification.js'
import { response } from './response.js'

/**
 * Group User Task With Status
 * GET /user/workload/:id
 * params have user id
 */
export const groupUserTasks = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const responseData = await aggregateData({
    matchData: { Assigned: mongoose.Types.ObjectId(`${id}`) },
    groupData: {
      _id: '$status',
      count: { $sum: 1 },
    },
  })
  response(res, 200, { users: responseData })
})

/**
 * Find User With Id
 * GET /user/:id
 * params have the userid
 * return user data in json type
 */
export const userData = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const user = await findUserWithId(id)
  response(res, 200, { user })
})

/**
 * Get User Activity
 * GET /user/:id/activity
 * params have user id
 * return user activity in array format
 */
export const userActivity = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const activity = await findUserActivity(id)
  response(res, 200, { activity })
})

/**
 * Get Assigned Task
 * GET /user/:id/task
 * params have user id
 * return array of element
 */
export const assignedTask = catchAsync(async (req, res, next) => {
  const { id, workspaceId } = req.params
  const assignedTasks = await taskAggregateWith4PipeLine({
    matchData: {
      Assigned: mongoose.Types.ObjectId(`${id}`),
      workspaceId: mongoose.Types.ObjectId(`${workspaceId}`),
    },
    lookupData: {
      from: 'users',
      localField: 'Assigned',
      foreignField: '_id',
      as: 'AssignedTo',
    },
    projectData: {
      'AssignedTo.password': 0,
    },
    groupData: {
      _id: '$status',
      data: { $push: '$$ROOT' },
    },
  })
  response(res, 200, { assignedTasks })
})

/**
 * Update Description
 * PATCH /user/{{userid}}/description
 * params have user id
 * return success message
 */
export const updateDiscription = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { description } = req.body
  const user = await updateUserDataWithId(id, { description })
  response(res, 200, { status: 'success', user })
})

/**
 * Find User Workspaces
 * GET /user/{{id}}/workspaces
 * params have user id
 * return workspace as array
 */
export const findWorkspace = catchAsync(async (req, res, next) => {
  const { id } = req.params
  let workspaces = await findWorkspaces(id)
  workspaces = workspaces.memberOf
  response(res, 200, { workspaces })
})

/**
 * Find Notification for users
 * GET /user/{{workspaceid}}/notification
 */
export const notificationsWithWorkspaceId = catchAsync(
  async (req, res, next) => {
    const { id } = req.params
    const notifications = await findNotifications(id)
    response(res, 200, { notifications })
  }
)

/**
 * Find All Users
 */
export const allUsers = catchAsync(async (req, res, next) => {
  const users = await allUsersFromDatabase()
  res.json({ users })
})
