"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RedisAdapter_1 = require("../studentcher-shared-utils/storage/RedisAdapter");
const Logger_1 = __importDefault(require("../helpers/Logger"));
exports.default = new RedisAdapter_1.RedisAdapter({
    host: process.env.REDIS_ADDRESS,
    port: parseInt(process.env.REDIS_PORT)
}, Logger_1.default);
//# sourceMappingURL=redisAdapter.js.map