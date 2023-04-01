import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
      required: [true, 'user must have an email.id'],
      lowercase: true,
    },
    mobile: Number,
    description: String,
    password: {
      type: String,
      select: false,
    },
    block: {
      type: Boolean,
      default: false,
    },
    Plan: {
      type: String,
      default: 'Free Plan',
    },
    memberOf: [
      {
        workspace: {
          type: mongoose.Types.ObjectId,
          ref: 'Workspace',
        },
        role: String,
      },
    ],
  },
  { virtuals: true }
)

// userSchema.pre(/^find/, function (next) {
//     this.populate("memberOf.workspace");
//     next();
// });

userSchema.virtual('task', {
  ref: 'tasks',
  localField: '_id',
  foreignField: 'Assigned',
  justOne: true,
})

const User = mongoose.model('User', userSchema)
export default User
