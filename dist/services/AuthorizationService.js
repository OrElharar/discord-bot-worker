"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthorizationService_1 = require("../studentcher-shared-utils/services/AuthorizationService");
const RolesRepository_1 = __importDefault(require("../repositories/RolesRepository"));
const CloudStorageAdapter_1 = __importDefault(require("../storage/CloudStorageAdapter"));
exports.default = new AuthorizationService_1.AuthorizationService(RolesRepository_1.default, CloudStorageAdapter_1.default);
//# sourceMappingURL=AuthorizationService.js.map