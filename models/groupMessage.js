import mongoose from 'mongoose'

const groupMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    workspace: { type: mongoose.Types.ObjectId, rel: 'Workspace' },
    message: String,
    time: String,
    userName: String,
  },
  { timestamps: true }
)

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema)
export default GroupMessage
