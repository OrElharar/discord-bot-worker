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
exports.UsersService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const CustomError_1 = require("../models/CustomError");
const ApiResponse_1 = require("../models/ApiResponse");
const Validations_1 = require("../helpers/Validations");
const Constants_1 = require("../helpers/Constants");
class UsersService {
    constructor(userRepository, rolesRepository, cloudService) {
        this.userRepository = userRepository;
        this.rolesRepository = rolesRepository;
        this.cloudService = cloudService;
    }
    static validateUserFields(data) {
        if (data.id == null)
            throw new CustomError_1.CustomError("User's id must be provided.");
        if (data.password != null) {
            const { result, message } = Validations_1.Validations.isPasswordValid(data.password);
            if (!result)
                throw new CustomError_1.CustomError(message);
        }
        if (data.phoneNumber != null) {
            const { result, message } = Validations_1.Validations.isPhoneNumberValid(data.phoneNumber);
            if (!result)
                throw new CustomError_1.CustomError(message);
        }
    }
    async getUsers(data) {
        try {
            const users = await this.userRepository.findMany(data);
            const roles = await this.rolesRepository.findMany(data);
            return { response: new ApiResponse_1.ApiResponse(true, { users, roles }) };
        }
        catch (err) {
            return { err };
        }
    }
    async getUser(data) {
        try {
            const user = await this.userRepository.findOne(data);
            return { response: new ApiResponse_1.ApiResponse(true, Object.assign({}, user)) };
        }
        catch (err) {
            return { err };
        }
    }
    async addUser(data) {
        try {
            const { result, message } = Validations_1.Validations.areFieldsProvided(["password", "name", "roleId", "discordUserId"], data);
            if (!result)
                return { err: new CustomError_1.CustomError(message) };
            UsersService.validateUserFields(data);
            data.hashedPassword = await UsersService.encryptionHandler.hash(data.password, 12);
            const user = await this.userRepository.addOne(data);
            return { response: new ApiResponse_1.ApiResponse(true, { user }) };
        }
        catch (err) {
            if (err.constraint === "users_pkey")
                return { err: new CustomError_1.CustomError("Email already registered in the system.") };
            return { err };
        }
    }
    async editUser(data) {
        try {
            if (data.id == null)
                return { err: new CustomError_1.CustomError("User's id must be provided.") };
            UsersService.validateUserFields(data);
            if (data.password != null)
                data.hashedPassword = await UsersService.encryptionHandler.hash(data.password, 12);
            const user = await this.userRepository.editOne(data);
            return { response: new ApiResponse_1.ApiResponse(true, { user }) };
        }
        catch (err) {
            return { err };
        }
    }
    async deleteUsers(data) {
        try {
            if (data.userIds.length === 0)
                return { err: new CustomError_1.CustomError("Users' ids must be provided") };
            if (data.userIds.includes(data.id))
                return { err: new CustomError_1.CustomError("User cannot delete itself") };
            const users = await this.userRepository.deleteMany(data);
            return { response: new ApiResponse_1.ApiResponse(true, { users }) };
        }
        catch (err) {
            return { err };
        }
    }
    async getPersonalZone(data) {
        var _a;
        try {
            const privateZoneData = await this.userRepository.getPrivateZone(data);
            const totalVideos = ((_a = privateZoneData === null || privateZoneData === void 0 ? void 0 : privateZoneData.currentActivity) === null || _a === void 0 ? void 0 : _a.videos.length) || 0;
            const signedVideos = [];
            for (let i = 0; i < totalVideos; i++) {
                const videoData = privateZoneData.currentActivity.videos[i];
                const generationResponse = await this.cloudService.generatePreSignUrl({ fileName: videoData.fileName, action: Constants_1.Constants.CLOUD_STORAGE_PRE_SIGNED_URL_READ_ACTION });
                if (generationResponse.err != null)
                    return { err: generationResponse.err };
                delete videoData.fileName;
                signedVideos.push(Object.assign(Object.assign({}, videoData), { srcUrl: generationResponse.response.data.preSignedUrl }));
            }
            privateZoneData.currentActivity = Object.assign(Object.assign({}, privateZoneData.currentActivity), { videos: signedVideos });
            return { response: new ApiResponse_1.ApiResponse(true, { privateZone: privateZoneData }) };
        }
        catch (err) {
            return { err };
        }
    }
    async addUserActivity(data) {
        try {
            const { result, message } = Validations_1.Validations.areFieldsProvided(["userId", "planId", "activityId"], data);
            if (!result)
                return { err: new CustomError_1.CustomError(message) };
            await this.userRepository.addUserActivity(data);
            return { response: new ApiResponse_1.ApiResponse(true, {}) };
        }
        catch (err) {
            if (err.constraint === "user_activity_history_pkey")
                return { err: new CustomError_1.CustomError("(user_id, plan_id, activity_id) already monitored in the system") };
            return { err };
        }
    }
    async addUserActivityVideoStatus(data) {
        try {
            const { result, message } = Validations_1.Validations.areFieldsProvided(["userId", "planId", "activityId", "videoIndex"], data);
            if (!result)
                return { err: new CustomError_1.CustomError(message) };
            const userActivityVideoStatus = await this.userRepository.addUserActivityVideo(data);
            return { response: new ApiResponse_1.ApiResponse(true, { userActivityVideoStatus }) };
        }
        catch (err) {
            if (err.constraint === "user_activity_history_pkey")
                return { err: new CustomError_1.CustomError("(user_id, plan_id, activity_id) already monitored in the system") };
            return { err };
        }
    }
}
exports.UsersService = UsersService;
UsersService.encryptionHandler = bcrypt;
//# sourceMappingURL=UsersService.js.map