const redis = require("redis");
const logger = require('../../helpers/loggingHelper');

const redisAddress = process.env.REDIS_PORT_6379_TCP_ADDR;

const client = redis.createClient({host: redisAddress})

client.on("error", function (err) {
    logger.error("Redis Error: " + err.message);
});


module.exports.get = function(key, cb) {
    client.get(key, cb);
};

module.exports.setInHash = async(hash, key, value)=>{
    const result = await redis.hset(hash, key, value)
    return result
}

