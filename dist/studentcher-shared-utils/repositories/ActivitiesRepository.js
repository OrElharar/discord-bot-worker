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
exports.ActivitiesRepository = void 0;
const queries = __importStar(require("../helpers/postgresQueriesHelper/activityManagement"));
const EntityRepository_1 = require("./EntityRepository");
const CustomError_1 = require("../models/CustomError");
class ActivitiesRepository extends EntityRepository_1.EntityRepository {
    constructor(pgClient) {
        super();
        this.pgClient = pgClient;
    }
    async findMany(_data) {
        const selectActivitiesQuery = ActivitiesRepository.queries.getSelectActivitiesQuery();
        const selectActivitiesValues = [];
        const response = await this.pgClient.callDbCmd(selectActivitiesQuery, selectActivitiesValues);
        return response.rows;
    }
    async addOne(data) {
        const insertActivityQuery = ActivitiesRepository.queries.getInsertActivityQuery();
        const insertActivityValues = [data.activityId, data.ownerId, data.name, data.srcUrl, data.maxThresholdInDays, data.responsibleRoleId];
        const insertVideoQuery = ActivitiesRepository.queries.getInsertVideoQuery();
        const insertVideoQueriesBucket = [];
        const insertVideoValuesBucket = [];
        data.videos.forEach((video, index) => {
            insertVideoQueriesBucket.push(insertVideoQuery);
            insertVideoValuesBucket.push([data.activityId, index + 1, video.title, video.fileName]);
        });
        const sqlQueries = [insertActivityQuery, ...insertVideoQueriesBucket];
        const sqlValues = [insertActivityValues, ...insertVideoValuesBucket];
        const response = await this.pgClient.callDbTransaction(sqlQueries, sqlValues);
        const activity = response[0].rows[0];
        for (let i = 1; i < sqlQueries.length; i++)
            activity.videos.push(response[i].rows[0]);
        return activity;
    }
    async editOne(data) {
        const updateActivityQuery = ActivitiesRepository.queries.getUpdateActivityQuery();
        const updateActivityValues = [data.activityId, data.ownerId, data.name, data.srcUrl, data.maxThresholdInDays, data.responsibleRoleId];
        const deleteActivityVideosQuery = ActivitiesRepository.queries.getDeleteActivityVideosQuery();
        const deleteActivityVideosValues = [data.activityId];
        const insertVideoQuery = ActivitiesRepository.queries.getInsertVideoQuery();
        const insertVideoQueriesBucket = [];
        const insertVideoValuesBucket = [];
        data.videos.forEach((video, index) => {
            insertVideoQueriesBucket.push(insertVideoQuery);
            insertVideoValuesBucket.push([data.activityId, index + 1, video.title, video.fileName]);
        });
        const sqlQueries = [updateActivityQuery, deleteActivityVideosQuery, ...insertVideoQueriesBucket];
        const sqlValues = [updateActivityValues, deleteActivityVideosValues, ...insertVideoValuesBucket];
        const response = await this.pgClient.callDbTransaction(sqlQueries, sqlValues);
        const activity = response[0].rows[0];
        for (let i = 2; i < sqlQueries.length; i++)
            activity.videos.push(response[i].rows[0]);
        return activity;
    }
    async deleteMany(data) {
        const deleteActivitiesQuery = ActivitiesRepository.queries.getDeleteActivitiesQuery();
        const deleteActivitiesValues = [data.activityIds];
        const response = await this.pgClient.callDbCmd(deleteActivitiesQuery, deleteActivitiesValues);
        if (response.rowCount === 0)
            throw new CustomError_1.CustomError("Activities not found", 404);
        return response.rows;
    }
    async addMetaData(data) {
        const insertActivityMetaDataQuery = ActivitiesRepository.queries.getInsertActivityMetaDataQuery();
        const insertActivityMetaDataValues = [data.planId, data.activityId, data.videoIndex, data.userId, data.metaData];
        await this.pgClient.callDbCmd(insertActivityMetaDataQuery, insertActivityMetaDataValues);
    }
}
exports.ActivitiesRepository = ActivitiesRepository;
ActivitiesRepository.queries = queries;
//# sourceMappingURL=ActivitiesRepository.js.map