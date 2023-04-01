import { createComment } from '../services/comment.js'
import catchAsync from '../utils/catchAsync.js'
import { response } from './response.js'

/**
 * Create Comment
 * POST /task/comment/:id
 * @description create comment params contain task id
 */
export const addComment = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { message } = req.body
  const comment = await createComment(id, message, req.user._id, req.user.name)
  response(res, 200, { comment })
})
