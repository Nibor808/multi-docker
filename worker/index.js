const keys = require("./keys");
const redis = require("redis");

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

const sub = redisClient.duplicate(); // subscribe to redis

const fib = (index) => {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
};

// message is index
// whenever we get a new value in redis -
// calculate new fib value and insert into a hash(map) called values
sub.on("message", (channel, message) => {
  redisClient.hset("values", message, fib(parseInt(message)));
});

// any "insert" event get the value and call "on"
sub.subscribe("insert");