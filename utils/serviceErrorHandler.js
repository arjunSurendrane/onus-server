const catchError = (fn) => {
  return (...args) => {
    fn(args).catch((error) => {
      return error
    })
  }
}

export default catchError
