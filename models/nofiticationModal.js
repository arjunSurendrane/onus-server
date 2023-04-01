import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    userName: String,
    workspaceId: {
      type: mongoose.Types.ObjectId,
      ref: 'Workspace',
    },
    taskName: String,
    taskid: {
      type: mongoose.Types.ObjectId,
      ref: 'Task',
    },
    action: String,
    message: String,
  },
  { capped: 1024, timestamps: true }
)

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification
