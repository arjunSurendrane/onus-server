import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  projectName: String,
  task: [
    {
      taskName: {
        type: mongoose.Types.ObjectId,
        ref: 'Task',
      },
    },
  ],
})

const Project = mongoose.model('Project', projectSchema)
export default Project
