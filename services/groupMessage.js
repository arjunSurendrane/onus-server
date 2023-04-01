import GroupMessage from '../models/groupMessage.js'

export const createGroupMessage = async (
  workspaceId,
  userId,
  message,
  userName
) => {
  const time = new Date(Date.now())
  return await GroupMessage.create({
    workspace: workspaceId,
    userId,
    message,
    userName,
    time,
  })
}

export const groupAllMessages = async (workspace) => {
  return await GroupMessage.find({ workspace })
}
