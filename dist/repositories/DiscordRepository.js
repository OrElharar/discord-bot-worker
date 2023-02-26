"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DiscordRepository_1 = require("../studentcher-shared-utils/repositories/DiscordRepository");
const postgresAdapter_1 = __importDefault(require("../storage/postgresAdapter"));
exports.default = new DiscordRepository_1.DiscordRepository(postgresAdapter_1.default);
//# sourceMappingURL=DiscordRepository.js.map