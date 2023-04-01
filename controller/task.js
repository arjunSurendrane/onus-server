import Task from '../models/taskModal.js'
import {
  deleteTaskUsingId,
  getTask,
  taskAggregateWith4PipeLine,
  updateTask,
} from '../services/Task.js'
import { updateProjectWithTaskData } from '../services/Project.js'
import { getFileStream, uploadFile } from '../config/s3.js'
import catchAsync from '../utils/catchAsync.js'
import { response } from './response.js'
import { createNotification } from '../services/notification.js'
import mongoose from 'mongoose'

/**
 * Group Task
 * GET /tasks/:id/list
 * @description - It is used to group task with its status (todo,inprogress,completed)
 * @param {Object} req - req.params.id = project ID
 * @param {Object} res - send task data to client
 */
export const groupAllTaks = catchAsync(async (req, res, next) => {
  const projectID = req.params.id
  const tasks = await taskAggregateWith4PipeLine({
    matchData: {
      projectID: mongoose.Types.ObjectId(`${projectID}`),
    },
    lookupData: {
      from: 'users',
      localField: 'Assigned',
      foreignField: '_id',
      as: 'AssignedTo',
    },
    projectData: {
      'AssignedTo.password': 0,
    },
    groupData: {
      _id: '$status',
      data: { $push: '$$ROOT' },
    },
  })
  response(res, 200, { tasks })
})

/**
 * Create Task
 * POST /task
 * @description - This is used to create task.
 * @param {Object} req
 * @param {Object} res
 */
export const createTask = catchAsync(async (req, res, next) => {
  const { projectId, taskName, description, dueDate } = req.body
  const { workspaceId } = req.params
  let link
  if (req.file) {
    const uploadResult = await uploadFile(req.file)
    link = uploadResult.Key
  }
  const newTask = new Task({
    taskName,
    description,
    workspaceId,
    dueDate,
    attachedfiles: [{ link }],
    createdBy: req.user._id,
    projectID: projectId,
  })
  const [project, task] = await Promise.all([
    updateProjectWithTaskData(projectId, newTask),
    newTask.save(),
  ])
  createNotification(
    req.user._id,
    req.user.name,
    workspaceId,
    task._id,
    task.taskName,
    'add task',
    'create a new task'
  )
  res.status(200).json({
    status: 'success',
    task,
    project,
  })
})

/**
 * Stream Attached File
 * GET /task/attachedFile/:key
 * @description It is used to send attached files from s3 to client
 */
export const streamAttachedFile = catchAsync(async (req, res, next) => {
  const key = req.params.key
  const readStream = getFileStream(key)
  readStream.pipe(res)
})

/**
 * Get All Task
 * GET /task
 * @description - It is used to retrieve all task form task collection
 */
export const allTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.find()
  res.status(200).json({
    tasks,
  })
})

/**
 * Get Task
 * GET /task/:id
 * @description - It is used to get one task data
 * @param {Object} req - the req params contain the task id
 */
export const getOneTask = catchAsync(async (req, res, next) => {
  const { taskid } = req.params
  const task = await getTask(taskid)
  response(res, 200, { task })
})

/**
 * Change Task Status
 * PATCH /task/status/:id
 * @description - This function is used to change task status (todo/inprogress/completed)
 * @param {Object} req - req.body contain the status and params contain the task id
 * @param {object} res - send task and success message to client
 */
export const changeTaskStatus = catchAsync(async (req, res, next) => {
  const { status, workspaceId } = req.body
  const id = req.params.id
  const task = await updateTask(id, { status }, req.user._id)
  createNotification(
    req.user._id,
    req.user.name,
    workspaceId,
    task._id,
    task.taskName,
    'change Status',
    `change task status to ${status}`
  )
  res.json({ status: 'success', task })
})

/**
 * Change Priority
 * PATCH /task/priority/:id
 * @description - Change the task priority
 * @param {Object} req - req.body => priority(string) req.params.id => taskId
 * @param {object} res - send task and success message to client
 */
export const changePriority = catchAsync(async (req, res, next) => {
  const { priority, workspaceId } = req.body
  const { id } = req.params
  const task = await updateTask(id, { priority }, req.user._id)
  createNotification(
    req.user._id,
    req.user.name,
    workspaceId,
    task._id,
    task.taskName,
    'change priority',
    `change ${task.taskName} priority`
  )
  res.json({ status: 'success', task })
})

/**
 * Delete Task
 * DELETE /:workspaceId/task/:id
 * @description - Delete task used to its id
 * @param {Object} req - req.params.id => taskId
 */
export const deleteTask = catchAsync(async (req, res, next) => {
  const { id, workspaceId } = req.params
  const task = await deleteTaskUsingId(id)
  createNotification(
    req.user._id,
    req.user.name,
    workspaceId,
    task._id,
    task.taskName,
    'delete task',
    `delete ${task.taskName}`
  )
  res.status(204).json({ status: 'success' })
})

/**
 * Assign Task
 * PATCH /task/assign
 * @description - Assign task to members they are exist in the workspace
 * @param {Object} req - req.body => userID,taskId
 * @param {object} res - send task and success message to client
 */
export const assignTask = catchAsync(async (req, res, next) => {
  const { taskId, userId } = req.body
  const task = await updateTask(taskId, { Assigned: userId }, req.user._id)
  res.status(200).json({ staus: 'success', task })
})

/**
 * Update Task
 * PATCH /task/:id
 * @param {Object} req - req.body have task details and params have task id
 * @param {Object} res - send success messagea and task data
 */
export const TaskUpdate = catchAsync(async (req, res, next) => {
  const id = req.params.id
  const { taskName, description, dueDate } = req.body
  let link
  if (req.file) {
    const uploadResult = await uploadFile(req.file)
    link = uploadResult.Key
  }
  let updateBody
  if (link) {
    updateBody = {
      taskName,
      description,
      dueDate,
      $set: { attachedfiles: { link } },
    }
  } else {
    updateBody = { taskName, description, dueDate }
  }
  const data = await updateTask(id, updateBody, req.user._id)
  response(res, 200, { task: data })
})

/**
 * Add Subtask
 * PATCH /task/subtask/:id
 * @param {Object} req - request contain name and description
 * @param {Object} res - send success message and task data
 */
export const addSubTask = catchAsync(async (req, res, next) => {
  const id = req.params.id
  const { name, description } = req.body
  const data = await updateTask(
    id,
    { $push: { subtasks: { name, description } } },
    req.user._id
  )
  response(res, 200, { task: data })
})

/**
 * Delete Subtask
 * DELETE /task/:id/:subtaskId
 */
export const deleteSubtask = catchAsync(async (req, res, next) => {
  const { id, subtaskId } = req.params
  const data = await updateTask(
    id,
    {
      $pull: { subtasks: { _id: subtaskId } },
    },
    req.user._id
  )
  response(res, 204, { task: data })
})

/**
 * Submit Task File
 * PATCH /task/submit/:id
 * req.params.id - task id
 * @description -  req.file have submit file and store it in s3 bucket using uploadFile function
 */
export const submitFile = catchAsync(async (req, res) => {
  const { id } = req.params
  const uploadResult = await uploadFile(req.file)
  const link = uploadResult.Key
  const data = await updateTask(id, { submitfile: link }, req.user._id)
  response(res, 200, { task: data })
})
