import {createClient} from "redis"

export const redis = createClient()
export const redisSub = redis.duplicate()

await redis.connect()
await redisSub.connect()