import mongoose from 'mongoose'
import Project from '../models/projectModal.js'
import Workspace from '../models/workSpaceModal.js'
import {
  deleteCache,
  getCacheData,
  updateCacheMemory,
} from '../redis/redisFunction.js'
import { GenerateIvitationMail } from '../services/Nodemailer.js'
import { DeleteProject } from '../services/Project.js'
import {
  aggregateData,
  deleteTaskWithProjectid,
  workspaceWorkloadWithAssignedUsers,
} from '../services/Task.js'
import {
  findUserWithoutPassword,
  updateRoleInUser,
  updateUserDataWithId,
  userWorkspaces,
} from '../services/User.js'
import {
  findWorkspace,
  getWorkspaceusingId,
  updateWorkspace,
} from '../services/Workspace.js'
import AppError from '../utils/appError.js'
import catchAsync from '../utils/catchAsync.js'
import { sendNotificationToUser } from './notification.js'
import { response } from './response.js'

/**
 * Success response
 * @param {Object} res
 * @param {Number} statusCode - status code
 * @param {data} data
 */
const successresponse = async (res, statusCode, data) => {
  res.status(statusCode).json({
    status: 'success',
    data,
  })
}

/**
 * Get Workspace
 */
export const getWorkspaceWithId = catchAsync(async (req, res) => {
  const { id } = req.params
  const workspace = await getWorkspaceusingId(id)
  sendNotificationToUser(workspace._id)
  let role = 'Member'
  if (req.user.memberOf[0].workspace == workspace._id) role = 'Admin'
  response(res, 200, { workspace, role })
})

/**
 * Create Workspace
 * POST '/'
 * @param {*} req - req.body contain name,department name, projectname
 * @param {*} res - send success message with workspace data
 */
export const createWorkspace = catchAsync(async (req, res, next) => {
  const { name, departmentName, projectName } = req.body
  const project = new Project({
    projectName,
  })
  const workspace = new Workspace({
    Name: name,
    Lead: req.user._id,
    department: {
      departmentName,
      project: [{ projectId: project._id }],
    },
  })
  const [projectDB, workspaceDB, user] = await Promise.all([
    project.save(),
    workspace.save(),
    updateUserDataWithId(workspace.Lead, {
      $push: { memberOf: { workspace: workspace._id }, role: 'owner' },
    }),
  ])
  console.log(workspaceDB)
  response(res, 200, { id: workspaceDB._id })
})

/**
 * Get All Workspace
 * GET /
 * @param {*} req
 * @param {*} res
 */
export const getWorkspace = catchAsync(async (req, res, next) => {
  let { limit } = req.query
  if (!limit) limit = 0
  const workspace = await findWorkspace(limit * 10)
  console.log(workspace)
  successresponse(res, 200, workspace)
})

/**
 * Add Department
 * PATCH /department/:id
 * @description - add department into workspace object
 * @param {*} req - req.body department name params have workspace id
 * @param {*} res
 */
export const addDepartment = catchAsync(async (req, res, next) => {
  if (req.workspace.plan === 'free' && req.workspace.department > 5)
    return next(new AppError('Please upgrade to business', 403))
  if (req.workspace.plan === 'business' && req.workspace.department > 10)
    return next(new AppError('Please upgrade to business plus', 403))
  const departmentName = req.body.name
  const id = req.params.id
  const workspace = await updateWorkspace(id, {
    $push: {
      department: { departmentName },
    },
  })
  if (!workspace) return next(new AppError('workspace not exist', 404))
  response(res, 200, { workspace })
})

/**
 * Add New Member
 * PATCH /member/:id
 * @description - Add a new member into workspace
 * @param {*} req - req.params.id = member id
 * @param {*} res - send success response with user data
 */
export const addMembers = catchAsync(async (req, res, next) => {
  const memberId = req.params.id
  const data = await getCacheData(`invitation-${memberId}`)
  deleteCache(`invitation-${memberId}`)
  if (data) {
    const { workspaceId, role } = data
    const [user] = await Promise.all([
      updateUserDataWithId(memberId, {
        $push: { memberOf: { workspace: workspaceId, role } },
      }),
    ])
    return successresponse(res, 200, { user })
  }
  next('already exist')
})

/**
 * Send Invitation
 * POST /invitation/:id
 * @description send invitation for users
 * @param {*} req - req.params.id = workspace id
 * @param {*} res
 */
export const sendInvitation = catchAsync(async (req, res, next) => {
  if (req.workspace.plan === 'free' && req.workspace.members > 5)
    return next(new AppError('Please upgrade to business', 403))
  if (req.workspace.plan === 'business' && req.workspace.members > 10)
    return next(new AppError('Please upgrade to business plus', 403))
  const workspaceId = req.params.id
  const { memberEmail, role } = req.body
  const user = await findUserWithoutPassword(memberEmail)
  if (!user) return next(new AppError('user not exist', 410))
  updateCacheMemory(`invitation-${user._id}`, {
    workspaceId,
    memberId: user._id,
    role,
  })
  GenerateIvitationMail(memberEmail, user.name, user._id)
  successresponse(res, 200, { email: user.email })
})

/**
 * Delete Member
 * DELETE /workspace/member/:id/:memberId
 * params have workspace id and member document id
 */
export const deleteMember = catchAsync(async (req, res, next) => {
  const { id, memberId } = req.params
  const user = await updateUserDataWithId(memberId, {
    $pull: { memberOf: { workspace: id } },
  })
  response(res, 204, user)
})

/**
 * Find Members in Workspace
 * GET /membres/:id
 * id => workspace id
 */
export const findMembers = catchAsync(async (req, res, next) => {
  const { id } = req.params
  let { limit } = req.query
  if (limit) limit = 0
  const members = await userWorkspaces(id, limit * 10)
  response(res, 200, { members })
})

/**
 * Workspace Dashboard
 */
export const membersWorkload = catchAsync(async (req, res, next) => {
  const { id, userId } = req.params
  let { limit } = req.body
  if (limit) limit = 0
  const userbasedWorkload = await aggregateData({
    matchData: {
      Assigned: mongoose.Types.ObjectId(`${userId}`),
      workspaceId: mongoose.Types.ObjectId(`${id}`),
    },
    groupData: {
      _id: '$status',
      data: { $push: '$$ROOT' },
    },
  })
  res.json({
    userbasedWorkload,
  })
})

/**
 * Workspace Workload
 */
export const workspaceWorkload = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const [workload, usersWorkload] = await Promise.all([
    aggregateData({
      matchData: {
        workspaceId: mongoose.Types.ObjectId(`${id}`),
      },
      groupData: {
        _id: '$status',
        count: { $sum: 1 },
      },
    }),
    workspaceWorkloadWithAssignedUsers(id),
  ])
  response(res, 200, { workload, usersWorkload })
})

/**
 * Find All Workspace Members
 */
export const findAllMembers = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const members = await userWorkspaces(id)
  response(res, 200, { members })
})

/**
 * Update Role
 */
export const updateRole = catchAsync(async (req, res) => {
  const { id, userId } = req.params
  const { role } = req.body
  const update = await updateRoleInUser(userId, id, role)
  response(res, 200, { update })
})

/**
 * Middleware for Check plan
 * @description this middleware is used to check the workpsace plan and counts
 */
export const checkWorkpsacePlanAndPermission = catchAsync(
  async (req, res, next) => {
    const { id } = req.params
    const [workspace, members] = await Promise.all([
      getWorkspaceusingId(id),
      userWorkspaces(id),
    ])
    req.workspace = {
      plan: workspace.plan ?? 'free',
      department: workspace.department.length,
      members: members.length,
    }
    next()
  }
)

/**
 * Delete Project
 */
export const deleteProject = async (req, res, next) => {
  const { projectid, workspaceid } = req.params
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const project = await DeleteProject(projectid, session)
    const task = await deleteTaskWithProjectid(projectid, session)
    const workspace = await updateWorkspace(
      workspaceid,
      {
        department: { $pull: { 'project.projectId': projectid } },
      },
      session
    )
    if (project && task && workspace) {
      await session.commitTransaction()
      response(res, 200, { message: 'deleted' })
    } else {
      session.abortTransaction()
      next(new AppError('something gone wrong', 404))
    }
  } catch (error) {
    session.abortTransaction()
    next(error)
  }
}
