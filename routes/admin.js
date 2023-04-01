import express from 'express'
import { adminLogin } from '../controller/adminAuth.js'
import { BlockUser, getAllUser } from '../controller/admin.js'
import { isAdmin, isAdminValid } from '../middleware/adminAuth.js'

const router = express.Router()

// Admin Registration
router.post('/login', adminLogin)
router.get('/isAdminValid', isAdminValid)
router.use(isAdmin)
router.get('/', (req, res) => {
  res.send('hello')
})
router.patch('/blockuser', BlockUser)
router.get('/getAllUser', getAllUser)

export default router
