"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RolesRepository_1 = require("../studentcher-shared-utils/repositories/RolesRepository");
const postgresAdapter_1 = __importDefault(require("../storage/postgresAdapter"));
exports.default = new RolesRepository_1.RolesRepository(postgresAdapter_1.default);
//# sourceMappingURL=RolesRepository.js.map