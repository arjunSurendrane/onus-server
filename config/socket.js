import { groupAllMessages } from '../services/groupMessage.js'
import { createMessage } from '../controller/groupMessage.js'
import { createComment, getComment } from '../services/comment.js'
import moment from 'moment'

let onlineUsers = {}

/**
 * Socket Class
 * @description create a socket class for connect to client with a websocket communication
 */
class socket {
  constructor(io) {
    io.on('connection', (socket) => {
      this.socket = socket
      /**
       * Join Task room
       */
      socket.on('joinRoom', (id) => {
        socket.join(id)
        this.sendCommentData(id)
      })
      /**
       * Create comment
       */
      socket.on('createComment', (data) => {
        this.newCommentCreated(data)
      })
      /**
       * Join worksapce room
       */
      socket.on('joinWorkspace', (data) => {
        const { workspaceId, userId, username } = data
        socket.join(workspaceId)
        const time = moment().format('dddd, MMMM Do YYYY, h:mm:ss a')
        if (
          onlineUsers[workspaceId]?.find((data) => data.userId === userId) !==
          undefined
        ) {
          console.log('')
        } else if (onlineUsers[workspaceId]) {
          onlineUsers[workspaceId] = [
            ...onlineUsers[workspaceId],
            { userId, socketId: socket.id, username, time },
          ]
        } else {
          onlineUsers[workspaceId] = [
            { userId, socketId: socket.id, username, time },
          ]
        }
        this.onlineUsers(workspaceId)
      })
      /**
       * Send All Group Message to Workspace room
       */
      socket.on('getGroupMessage', async (data) => {
        this.getGroupMessage(data)
      })
      /**
       * Create New Message and Send to Workspace room
       */
      socket.on('createMessage', async (data) => {
        this.createGrupMessage(data)
      })
      /**
       * Litsen connection error
       */
      socket.on('connect_error', (err) => {
        console.log(`connect_error due to ${err.message}`)
      })
      /**
       * Litsen online user request event
       */
      socket.on('onlineUsers', (data) => {
        const { id } = data
        this.onlineUsers(id)
      })
      /**
       * litsen exit workspace room event
       */
      socket.on('exitWorkspace', (data) => {
        console.log(data)
      })
      /**
       * disconnect
       */
      socket.on('diconnect', () => {
        onlineUsers = onlineUsers.filter((data) => data.socketId !== socket.id)
        console.log('disconnected')
      })
    })
    this.io = io
  }

  createGrupMessage = async (data) => {
    const newMessage = await createMessage(data)
    this.io.to(data.id).emit('newMessage', [newMessage])
  }

  getGroupMessage = async (data) => {
    const allMessages = await groupAllMessages(data)
    this.io.to(data).emit('newMessage', allMessages)
  }
  /**
   * Send Comment
   * @param {import("mongoose").ObjectId} id - comment id
   */

  sendCommentData = async (id) => {
    const data = await getComment(id)
    console.log(data)
    this.io.to(id).emit('data', data)
  }
  /**
   * Create New Comment
   * @param {Object} data - comment data
   */

  newCommentCreated = async (data) => {
    try {
      const { id, message, userName, userId } = data
      const res = await createComment(id, message, userId, userName)
      this.io.to(id).emit('newComment', res)
    } catch (error) {
      this.socket.emit('error', error)
    }
  }
  /**
   * Send Online Users data
   * @param {*} id - workspace id
   */

  onlineUsers = async (id) => {
    this.io.to(id).emit('onlineUsersList', { onlineMembers: onlineUsers[id] })
  }
  /**
   * Send Notification to user
   * @param {Object} data - notification data
   * @param {*} id  - workspace id
   */

  sendNotification = async (data, id) => {
    this.io.to(id).emit('notifications', data)
  }
}

export default socket
