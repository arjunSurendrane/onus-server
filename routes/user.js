import express from 'express'
import { catchPayment, create } from '../controller/payment.js'
import {
  allUsers,
  assignedTask,
  findWorkspace,
  groupUserTasks,
  notificationsWithWorkspaceId,
  updateDiscription,
  userActivity,
  userData,
} from '../controller/user.js'
import {
  generateOtpForOtpLogin,
  login,
  otpVerification,
  sendEmail,
  userDetails,
  verifyOtp,
} from '../controller/userAuth.js'
import { isUser, isUserValid } from '../middleware/userAuth.js'
const router = express.Router()

// User Registration
router.post('/login', login)
router.get('/', allUsers)
router.post('/emailVerifiction', sendEmail)
router.post('/otpVerification', otpVerification)
router.post('/otpLogin', generateOtpForOtpLogin)
router.post('/verifyOtpLogin', verifyOtp)
router.patch('/:id/description', updateDiscription)
router.get('/isUserValid', isUserValid)
router.get('/userDetails', userDetails)
router.get('/:id/notification', notificationsWithWorkspaceId)
router.get('/workload/:id', groupUserTasks)
router.get('/member/:id/workspace', findWorkspace)
router.get('/:id', userData)
router.get('/:id/activity', userActivity)
router.get('/:id/task/:workspaceId', assignedTask)
/**
 * Authorization Middleware
 */
router.use(isUser)
/**
 * Protected Route
 */
router.post('/my-server/create-paypal-order', create)
router.post('/my-server/capture-paypal-order', catchPayment)

export default router
