/**
 * Connect to localhost
 * @param {Object} httpServer - http.createServer(app)
 */
const connecToPort = (httpServer) => {
  httpServer.listen(4000, () => {
    console.log('connected to 4000')
  })
}
export default connecToPort
