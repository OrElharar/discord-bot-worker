import {RedisAdapter} from "../studentcher-shared-utils/storage/RedisAdapter";
import logger from "../helpers/Logger";

export default new RedisAdapter({
        host: process.env.REDIS_ADDRESS,
        port: parseInt(process.env.REDIS_PORT)},
    logger)
