import { connectToRedis } from './connect.js'

// function for get or set data from redis
export async function getOrSetFunction(key, cb) {
  try {
    const redisClient = await connectToRedis()
    const res = await redisClient.get(key)
    if (res != null) {
      return JSON.parse(res)
    }
    const fetchData = await cb()
    redisClient.setEx(key, process.env.REDIS_EXPIRE, JSON.stringify(fetchData))
    return fetchData
  } catch (err) {
    return err
  }
}

// update data
export async function updateCacheMemory(key, data) {
  try {
    const redisClient = await connectToRedis()
    const res = await redisClient.setEx(
      key,
      process.env.REDIS_EXPIRE,
      JSON.stringify(data)
    )
    return res
  } catch (error) {
    return error
  }
}

/**
 * Delete cache
 * @param {String} key
 * @returns
 */
export async function deleteCache(key) {
  try {
    const redisClient = await connectToRedis()
    const del = await redisClient.del(key)
    return del
  } catch (error) {
    return error
  }
}

/**
 * Get Cache Data
 * @param {String} key - payment order key
 * @returns {object} - payment order data from redis
 */
export async function getCacheData(key) {
  try {
    const redisClient = await connectToRedis()
    const data = await redisClient.get(key)
    return JSON.parse(data)
  } catch (error) {
    return error
  }
}
