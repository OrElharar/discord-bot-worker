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
exports.ActivitiesService = void 0;
const uuid = __importStar(require("uuid"));
const CustomError_1 = require("../models/CustomError");
const Validations_1 = require("../helpers/Validations");
const ApiResponse_1 = require("../models/ApiResponse");
class ActivitiesService {
    constructor(authorizationService, activitiesRepository, usersRepository, rolesRepository) {
        this.authorizationService = authorizationService;
        this.activitiesRepository = activitiesRepository;
        this.usersRepository = usersRepository;
        this.rolesRepository = rolesRepository;
    }
    async getActivities(data) {
        try {
            const activities = await this.activitiesRepository.findMany({});
            const users = await this.usersRepository.findMany(data);
            const roles = await this.rolesRepository.findMany(data);
            return { response: new ApiResponse_1.ApiResponse(true, { activities, users, roles }) };
        }
        catch (err) {
            return { err };
        }
    }
    static validatedActivityFields(data) {
        if (data.videos != null) {
            data.videos.forEach((video) => {
                const { result, message } = Validations_1.Validations.areFieldsProvided(["title", "fileName"], video);
                if (!result)
                    throw new CustomError_1.CustomError(message);
            });
        }
        if (data.srcUrl != null) {
            const { result, message } = Validations_1.Validations.isUrlValid(data.srcUrl);
            if (!result)
                throw new CustomError_1.CustomError(message);
        }
        if (data.videos != null && !Array.isArray(data.videos))
            throw new CustomError_1.CustomError("Activity's videos must be an array.");
    }
    async validatedActivityFields(data) {
        ActivitiesService.validatedActivityFields(data);
        if (!Array.isArray(data.videos))
            return;
        const fileNamesVerifications = data.videos.map(({ fileName }) => this.authorizationService.verifyAccessToFileOnCloud(fileName));
        await Promise.all(fileNamesVerifications);
    }
    async addActivity(data) {
        try {
            const { result, message } = Validations_1.Validations.areFieldsProvided(["name", "videos"], data);
            if (!result)
                return { err: new CustomError_1.CustomError(message) };
            await this.validatedActivityFields(data);
            data.activityId = ActivitiesService.idGenerator();
            const activity = await this.activitiesRepository.addOne(data);
            return { response: new ApiResponse_1.ApiResponse(true, { activity }) };
        }
        catch (err) {
            switch (err.constraint) {
                case "activities_name_key":
                    return { err: new CustomError_1.CustomError("Name already taken and must be unique") };
                case "activities_created_by_fkey":
                    return { err: new CustomError_1.CustomError("User id is invalid") };
                default:
                    return { err };
            }
        }
    }
    async editActivity(data) {
        try {
            if (data.activityId == null)
                return { err: new CustomError_1.CustomError("Activity's id must be provided") };
            await this.validatedActivityFields(data);
            const activity = await this.activitiesRepository.editOne(data);
            return { response: new ApiResponse_1.ApiResponse(true, { activity }) };
        }
        catch (err) {
            switch (err.constraint) {
                case "activities_name_key":
                    return { err: new CustomError_1.CustomError("Name already taken and must be unique") };
                case "activities_created_by_fkey":
                    return { err: new CustomError_1.CustomError("User id is invalid") };
                case "activity_videos_src_url_check":
                    return { err: new CustomError_1.CustomError("One of the activities' src url is invalid") };
                default:
                    return { err };
            }
        }
    }
    async deleteActivities(data) {
        try {
            if (data.activityIds.length === 0)
                return { err: new CustomError_1.CustomError("Activities' ids must be provided") };
            const activities = await this.activitiesRepository.deleteMany(data);
            return { response: new ApiResponse_1.ApiResponse(true, { activities }) };
        }
        catch (err) {
            return { err };
        }
    }
    async addActivityMetaData(data) {
        try {
            if (data.activityId == null)
                return { err: new CustomError_1.CustomError("Activity' id must be provided") };
            if (data.metaData == null)
                return { err: new CustomError_1.CustomError("Activity' meta data must be provided") };
            await this.activitiesRepository.addMetaData(data);
            return { response: new ApiResponse_1.ApiResponse(true, {}) };
        }
        catch (err) {
            if (err.constraint === "activity_user_meta_data")
                return { err: new Error("Invalid data provided - (user's id, plan's id, activity's id, index) is not mention in User's activity history") };
            if (err.constraint === "user_activity_meta_data_meta_data_check")
                return { err: new CustomError_1.CustomError("Invalid data for activity's meta data.") };
            return { err };
        }
    }
}
exports.ActivitiesService = ActivitiesService;
ActivitiesService.idGenerator = uuid.v1;
//# sourceMappingURL=ActivitiesService.js.map