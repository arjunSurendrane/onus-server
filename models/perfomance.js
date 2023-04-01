import mongoose from 'mongoose'

const mongooseType = mongoose.Schema.Types

const perfomanceSchema = new mongoose.Schema({
  workspace: {
    type: mongooseType.ObjectId,
    ref: 'Workspace',
  },
  userId: {
    type: mongooseType.ObjectId,
    ref: 'User',
  },
  userPoints: [
    {
      tasks: {
        type: mongooseType.ObjectId,
        ref: 'Task',
      },
      point: Number,
    },
  ],
})

perfomanceSchema.pre(/^find/, function (next) {
  this.populate(['userPoints.tasks'])
  next()
})

const Perfomance = mongoose.model('Perfomance', perfomanceSchema)
export default Perfomance
