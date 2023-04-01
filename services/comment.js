import Comment from '../models/discussion.js'

/**
 * Create New Comment
 * @param {String} task - task id
 * @param {String} message - message ie comment message
 * @param {String} userid - user id
 * @param {String} userName - user name
 * @returns {Object} - return Comment object
 */
export const createComment = async (task, message, userid, userName) => {
  return await Comment.findOneAndUpdate(
    { task },
    {
      $push: {
        comments: [
          {
            userid,
            name: userName,
            message,
          },
        ],
      },
    },
    { upsert: true, new: true }
  )
}

export const getComment = async (id) => {
  return await Comment.findOne({ task: id })
}
