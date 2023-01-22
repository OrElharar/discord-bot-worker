"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesRepository = void 0;
const EntityRepository_1 = require("./EntityRepository");
const userManagementQueries = __importStar(require("../helpers/postgresQueriesHelper/userManagement"));
const PostgresAdapter_1 = require("../storage/PostgresAdapter");
const CustomError_1 = require("../models/CustomError");
class RolesRepository extends EntityRepository_1.EntityRepository {
    constructor() {
        super();
        this.dbClient = PostgresAdapter_1.PgClient;
    }
    async findMany(data) {
        const selectRolesDataQuery = userManagementQueries.getSelectRolesDataQuery();
        const selectRolesDataValues = [data.userId];
        const response = await this.dbClient.callDbCmd(selectRolesDataQuery, selectRolesDataValues);
        return response.rows;
    }
    async isRoleAccessible(data) {
        const response = await this.dbClient.callDbCmd(userManagementQueries.getSelectIsRoleIdValid(), [data.userId, data.roleId]);
        if (response.rows[0].count === 0)
            throw new CustomError_1.CustomError("User not having needed permissions, access denied");
        return response.rows[0].isRoleAccessible;
    }
    async isUserPermissionAllowed(data) {
        const sqlQuery = userManagementQueries.getSelectIsUserPermissionAllowedQuery(data.permissionField);
        const values = [data.userId];
        const response = await this.dbClient.callDbCmd(sqlQuery, values);
        return response.rows[0].isUserPermissionAllowed;
    }
    async findUserPermissions(data) {
        const selectUserPermissionsQuery = userManagementQueries.getSelectUserPermissionsQuery();
        const values = [data.userId];
        const response = await this.dbClient.callDbCmd(selectUserPermissionsQuery, values);
        return response.rows[0].userPermissions;
    }
    static async addOne(_data) {
        throw new Error("Method not implemented.");
    }
    static async deleteMany(_data) {
        throw new Error("Method not implemented.");
    }
    static editOne(_data) {
        throw new Error("Method not implemented.");
    }
}
exports.RolesRepository = RolesRepository;
//# sourceMappingURL=RolesRepository.js.map