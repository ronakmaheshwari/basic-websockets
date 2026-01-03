import {createClient} from "redis"

export const redis = createClient()
export const redisSub = redis.duplicate();

(async () => {
  await redis.connect();
  await redisSub.connect();
})();