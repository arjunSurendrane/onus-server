import Project from '../models/projectModal.js'
import { groupAllTask } from '../services/Project.js'
import { updateNestedDocument } from '../services/Workspace.js'
import catchAsync from '../utils/catchAsync.js'
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
 * Create Project
 * POST /project
 * @param {*} req - req.body contain proejct name, workspace id, department id
 * @param {*} res - success message with project data
 */
export const createProject = catchAsync(async (req, res) => {
  const { projectName, workspaceId, departmentID } = req.body
  const project = new Project({
    projectName,
  })
  const [workspace, projectSave] = await Promise.all([
    updateNestedDocument(
      { _id: workspaceId, 'department._id': departmentID },
      { $push: { 'department.$.project': { projectId: project._id } } }
    ),
    project.save(),
  ])
  response(res, 200, { workspace, projectSave })
})

/**
 * Project Data
 * GET /projects/:id
 * @param {*} req
 * @param {*} res
 */
export const projects = catchAsync(async (req, res) => {
  const projectID = req.params.id
  const projects = await groupAllTask(projectID)
  successresponse(res, 200, projects)
})
