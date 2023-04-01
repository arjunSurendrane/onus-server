import Redis from 'redis'

export async function connectToRedis() {
  // type url link inside createClient when it in the production
  try {
    const redisClient = Redis.createClient()
    await redisClient.connect()
    return redisClient
  } catch (error) {}
}
