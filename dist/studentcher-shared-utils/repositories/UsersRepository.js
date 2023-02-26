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
exports.UsersRepository = void 0;
const EntityRepository_1 = require("./EntityRepository");
const userManagementQueries = __importStar(require("../helpers/postgresQueriesHelper/userManagement"));
const CustomError_1 = require("../models/CustomError");
class UsersRepository extends EntityRepository_1.EntityRepository {
    constructor(pgClient) {
        super();
        this.pgClient = pgClient;
    }
    async addOne(data) {
        const insertUserQuery = userManagementQueries.getInsertUserQuery();
        const insertUserValues = [data.id, data.name, data.hashedPassword, data.phoneNumber, data.roleId, data.discordUserId];
        const response = await this.pgClient.callDbCmd(insertUserQuery, insertUserValues);
        return response.rows[0];
    }
    async deleteMany(data) {
        const updateUserQuery = userManagementQueries.getDeleteUsersQuery();
        const updateUserValues = [data.userIds];
        const response = await this.pgClient.callDbCmd(updateUserQuery, updateUserValues);
        if (response.rowCount === 0)
            throw new CustomError_1.CustomError("Users not found.");
        return response.rows;
    }
    async editOne(data) {
        const updateUserQuery = userManagementQueries.getUpdateUserQuery();
        const updateUserValues = [data.id, data.phoneNumber, data.name, data.roleId, data.hashedPassword, data.discordUserId];
        const response = await this.pgClient.callDbCmd(updateUserQuery, updateUserValues);
        if (response.rowCount === 0)
            throw new CustomError_1.CustomError("User not found.");
        return response.rows[0];
    }
    async findMany(data) {
        const selectUsersQuery = userManagementQueries.getSelectUsersQuery();
        const selectUsersValues = [data.userId];
        const response = await this.pgClient.callDbCmd(selectUsersQuery, selectUsersValues);
        return response.rows;
    }
    async getPrivateZone(data) {
        const selectPersonalZoneQuery = userManagementQueries.getSelectPersonalZoneQuery();
        const selectPersonalZoneValues = [data.userId];
        const response = await this.pgClient.callDbCmd(selectPersonalZoneQuery, selectPersonalZoneValues);
        const privateZone = response.rows[0];
        if (privateZone == null)
            throw new CustomError_1.CustomError("Personal zone not found.");
        return privateZone;
    }
    async findOne(data) {
        const selectUserDataQuery = userManagementQueries.getSelectUserDataQuery();
        const values = [data.userId];
        const response = await this.pgClient.callDbCmd(selectUserDataQuery, values);
        return response.rows[0];
    }
    async addUserActivity(data) {
        const insertUserActivity = userManagementQueries.getInsertUserActivityQuery();
        const values = [data.userId, data.planId, data.activityId, data.isEnded];
        await this.pgClient.callDbCmd(insertUserActivity, values);
    }
    async addUserActivityVideo(data) {
        const insertUserActivity = userManagementQueries.getInsertUserActivityVideoStatusQuery();
        const values = [data.userId, data.planId, data.activityId, data.videoIndex, data.isCompleted];
        const response = await this.pgClient.callDbCmd(insertUserActivity, values);
        return response.rows[0];
    }
}
exports.UsersRepository = UsersRepository;
//# sourceMappingURL=UsersRepository.js.map