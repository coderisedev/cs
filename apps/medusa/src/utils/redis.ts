/**
 * Redis connection utilities with proper resource management
 */

import Redis from "ioredis"
import { getRedisUrl } from "./env"
import { logger } from "./logger"

// Singleton Redis client for connection pooling
let redisClient: Redis | null = null

/**
 * Get a shared Redis client instance
 * Uses connection pooling to avoid creating new connections per request
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = getRedisUrl()
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      enableReadyCheck: true,
      lazyConnect: true,
    })

    redisClient.on("error", (err) => {
      logger.error("Redis connection error", err)
    })

    redisClient.on("connect", () => {
      logger.debug("Redis connected")
    })
  }

  return redisClient
}

/**
 * Execute a Redis operation with proper error handling
 * Use this for simple operations where you don't need the raw client
 */
export async function withRedis<T>(
  operation: (client: Redis) => Promise<T>
): Promise<T> {
  const client = getRedisClient()

  try {
    // Ensure connection is ready
    if (client.status !== "ready" && client.status !== "connecting") {
      await client.connect()
    }

    return await operation(client)
  } catch (error) {
    logger.error("Redis operation failed", error)
    throw error
  }
}

/**
 * Execute a Redis operation with a dedicated connection
 * Use this when you need isolation or for long-running operations
 * The connection is automatically closed after the operation
 */
export async function withDedicatedRedis<T>(
  operation: (client: Redis) => Promise<T>
): Promise<T> {
  const redisUrl = getRedisUrl()
  const client = new Redis(redisUrl)

  try {
    return await operation(client)
  } finally {
    // Always close the dedicated connection
    await client.quit().catch((err) => {
      logger.warn("Failed to close Redis connection", { error: err })
    })
  }
}

/**
 * Safely parse JSON from Redis with error handling
 */
export function safeJsonParse<T>(data: string | null): T | null {
  if (!data) return null

  try {
    return JSON.parse(data) as T
  } catch (error) {
    logger.error("Failed to parse JSON from Redis", error, { dataLength: data.length })
    return null
  }
}

/**
 * Close the shared Redis connection
 * Call this during graceful shutdown
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    logger.debug("Redis connection closed")
  }
}
