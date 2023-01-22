"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisAdapter = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class RedisAdapter {
    constructor({ host = "", port }, logger) {
        const redisPort = isNaN(port) || port == null ? 6379 : port;
        this.client = new ioredis_1.default({ port: redisPort, host });
        this.TOPICS_SUBSCRIBERS = {};
        this.logger = logger;
        this.client.on("connect", function () {
            logger.info(`Redis client connected`);
        });
        this.client.on("error", function (err) {
            logger.error(err.message);
        });
    }
    async subscribe(topic) {
        this.logger.debug(`RedisAdapter subscribe to topic: ${topic}`);
        if (topic == null)
            throw new Error("topic must be provided.");
        if (this.TOPICS_SUBSCRIBERS[topic] != null)
            return;
        this.TOPICS_SUBSCRIBERS[topic] = true;
        await this.client.subscribe(topic);
    }
    async unsubscribe(topic) {
        this.logger.debug(`RedisAdapter unsubscribe from topic: ${topic}`);
        if (topic == null)
            throw new Error("topic must be provided.");
        const isSubscribed = this.TOPICS_SUBSCRIBERS[topic];
        if (!isSubscribed)
            return;
        await this.client.unsubscribe(topic);
        delete this.TOPICS_SUBSCRIBERS[topic];
    }
    async publish(topic, message) {
        this.logger.debug(`Publishing message using RedisAdapter: ${topic}, ${message}`);
        await this.client.publish(topic, message);
    }
}
exports.RedisAdapter = RedisAdapter;
//# sourceMappingURL=RedisAdapter.js.map