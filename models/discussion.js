import mongoose from 'mongoose'

const mongooseType = mongoose.Schema.Types

const discussionSchema = new mongoose.Schema({
  task: {
    type: mongooseType.ObjectId,
    ref: 'Task',
  },
  comments: [
    {
      userid: mongooseType.ObjectId,
      name: String,
      message: String,
      time: {
        type: Date,
        default: new Date(Date.now()),
      },
    },
  ],
})

const Comment = mongoose.model('Comment', discussionSchema)
export default Comment
