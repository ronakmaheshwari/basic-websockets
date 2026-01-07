import {createClient} from "redis"

export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});
export const redisSub = redis.duplicate();

(async () => {
  await redis.connect();
  await redisSub.connect();
})();