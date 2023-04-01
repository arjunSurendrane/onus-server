import mongoose from 'mongoose'

const workSpaceSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, 'workspace must have a name'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  plan: String,

  Lead: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  department: [
    {
      departmentName: String,
      project: [
        {
          projectId: {
            type: mongoose.Types.ObjectId,
            ref: 'Project',
          },
        },
      ],
    },
  ],
})

workSpaceSchema.pre(/^find/, function (next) {
  this.populate(['department.project.projectId', 'Lead'])
  next()
})

workSpaceSchema.pre(/^save/, function (next) {
  this.populate(['department.project.projectId', 'Lead'])
  next()
})

const Workspace = mongoose.model('Workspace', workSpaceSchema)
export default Workspace
