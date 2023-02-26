"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DiscordService_1 = require("../studentcher-shared-utils/services/DiscordService");
const DiscordRepository_1 = __importDefault(require("../repositories/DiscordRepository"));
exports.default = new DiscordService_1.DiscordService(DiscordRepository_1.default);
//# sourceMappingURL=DiscordService.js.map