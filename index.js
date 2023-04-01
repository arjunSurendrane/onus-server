import express from 'express'
import bodyParser from 'body-parser'
import logger from 'morgan'
import cores from 'cors'
import dotenv from 'dotenv'
import userRoute from './routes/user.js'
import workSpaceRoute from './routes/workSpace.js'
import adminRoute from './routes/admin.js'
import { globalErrorHandling } from './middleware/errorHandling.js'
import connectToDB from './config/db.js'
import connecToPort from './config/server.js'
import { Server } from 'socket.io'
import { createServer } from 'http'
import Socket from './config/socket.js'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import xssClean from 'xss-clean'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

dotenv.config({ path: './config.env' })
const app = express()
app.use(helmet())
app.use(bodyParser.json())
app.use(logger('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(cores())

const httpServer = createServer(app)

export const io = new Server(httpServer, {
  cors: {
    origin: ['https://onus.onrender.com'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
})

/**
 * Connect to database
 */
connectToDB()

/**
 * Sanitize request
 */
app.use(mongoSanitize())

// app.use(express.static(path.join(__dirname, '../client', 'dist')))

/**
 *Data sanitization against stite script xss
 */
app.use(xssClean())

/**
 * Route setup
 */
// app.use('/api/auth')
app.use('/api/admin', adminRoute)
app.use('/api/user', userRoute)
app.use('/api/workspace', workSpaceRoute)
export const websocketServer = new Socket(io)

// app.get('/*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client', 'dist', 'index.html'))
// })

/**
 * Connect to port
 */
connecToPort(httpServer)

/**
 * Global error handling middleware
 */
app.use(globalErrorHandling)
