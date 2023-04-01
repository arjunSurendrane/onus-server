import mongoose from 'mongoose'
import { sendNotificationToUser } from '../controller/notification.js'
import Notification from '../models/nofiticationModal.js'
export const createNotification = async (
  userId,
  userName,
  workspaceId,
  taskid,
  taskName,
  action,
  message
) => {
  const data = await Notification.create({
    userId,
    userName,
    workspaceId,
    taskid,
    taskName,
    action,
    message,
  })
  sendNotificationToUser(workspaceId)
}

/**
 * Get Notification data
 * @param {String} workspaceId
 * @returns {Object} return notification data
 */
export const notifications = async (workspaceId) => {
  return await Notification.aggregate([
    { $match: { workspaceId: mongoose.Types.ObjectId(`${workspaceId}`) } },
    { $group: { _id: '$taskid', data: { $push: '$$ROOT' } } },
    { $sort: { 'data.createdAt': -1 } },
  ])
}

/**
 * Find User Activity
 * used by user
 * @param {String} id - find user activity
 * @returns
 */
export const findUserActivity = async (id) => {
  return await Notification.find({ userId: id }).sort({ createdAt: -1 })
}
