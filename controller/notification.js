import { websocketServer } from '../index.js'
import { notifications } from '../services/notification.js'

export const sendNotificationToUser = async (workspaceId) => {
  const data = await notifications(workspaceId)
  websocketServer.sendNotification(data, workspaceId)
}

/**
 * Find notification with workspaceid
 * used bu user
 * @param {*} workspaceId
 * @returns
 */
export const findNotifications = async (workspaceId) => {
  const data = await notifications(workspaceId)
  return data
}
