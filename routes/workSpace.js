import express from 'express'
import { createProject, projects } from '../controller/project.js'
import {
  allTasks,
  assignTask,
  changePriority,
  changeTaskStatus,
  createTask,
  deleteTask,
  groupAllTaks,
  getOneTask,
  streamAttachedFile,
  TaskUpdate,
  addSubTask,
  deleteSubtask,
  submitFile,
} from '../controller/task.js'
import {
  addDepartment,
  addMembers,
  checkWorkpsacePlanAndPermission,
  createWorkspace,
  deleteMember,
  deleteProject,
  findMembers,
  getWorkspace,
  getWorkspaceWithId,
  membersWorkload,
  sendInvitation,
  updateRole,
  workspaceWorkload,
} from '../controller/workspace.js'
import multer from 'multer'
import { isUser } from '../middleware/userAuth.js'
import { addComment } from '../controller/comment.js'
const upload = multer({ dest: './assets/files' })
const router = express.Router()

/**
 * Route /workspace/*
 */
router.get('/task/attachedFile/:key', streamAttachedFile)
router.patch('/member/:id', addMembers)
router.get('/task', allTasks)
/**
 * Authorization Middleware
 */
router.use(isUser)
/**
 * Protected Routes
 */
router.post('/', createWorkspace)
router.post('/:workspaceId/task', upload.single('attachedFile'), createTask)
router.post('/project', createProject)
router.post('/invitation/:id', checkWorkpsacePlanAndPermission, sendInvitation)
router.post('/task/comment/:id', addComment)
router.patch('/department/:id', checkWorkpsacePlanAndPermission, addDepartment)
router.patch('/task/status/:id', changeTaskStatus)
router.patch('/task/submit/:id', upload.single('file'), submitFile)
router.patch('/task/subtask/:id', addSubTask)
router.patch('/task/priority/:id', changePriority)
router.patch('/task/assign', assignTask)
router.patch('/:id/member/:userId/role', updateRole)
router.patch('/task/:id', upload.single('attachedFile'), TaskUpdate)
router.delete('/:workspaceId/task/:id', deleteTask)
router.delete('/task/:id/:subtaskId', deleteSubtask)
router.delete('/member/:id/:memberId', deleteMember)
router.delete('/:workspaceid/project/:projectid', deleteProject)
router.get('/', getWorkspace)
router.get('/members/:id', findMembers)
router.get('/:id/members/:userId/workload', membersWorkload)
router.get('/:id/workload', workspaceWorkload)
router.get('/:id', getWorkspaceWithId)
router.get('/tasks/:id/list', groupAllTaks)
router.get('/task/:taskid', getOneTask)
router.get('/projects/:id', projects)

export default router
