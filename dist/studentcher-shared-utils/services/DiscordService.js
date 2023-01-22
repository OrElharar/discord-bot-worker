"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordService = void 0;
const CustomError_1 = require("../models/CustomError");
const DiscordRepository_1 = require("../repositories/DiscordRepository");
const Validations_1 = require("../helpers/Validations");
const ApiResponse_1 = require("../models/ApiResponse");
const Constants_1 = require("../helpers/Constants");
class DiscordService {
    constructor() {
        this.discordRepository = new DiscordRepository_1.DiscordRepository();
    }
    static isUserStatusValid(status) {
        if (status == null)
            return false;
        const optionalStatuses = [Constants_1.Constants.DISCORD_MEMBER_ACTIVE_STATUS, Constants_1.Constants.DISCORD_MEMBER_BREAK_STATUS,
            Constants_1.Constants.DISCORD_MEMBER_BUSY_STATUS, Constants_1.Constants.DISCORD_MEMBER_LEFT_STATUS];
        return optionalStatuses.includes(status);
    }
    static areUserTrackingInputsValid(usersTracking) {
        const errorMessages = [];
        if (usersTracking == null || !Array.isArray(usersTracking) || usersTracking.length === 0)
            return { result: false, message: `usersTracking: ${usersTracking} field must be provided as an array` };
        for (let i = 0; i < usersTracking.length; i++) {
            const userTracking = usersTracking[i];
            const { result, message } = Validations_1.Validations.areFieldsProvided(["userId"], userTracking);
            if (userTracking.status != null && !DiscordService.isUserStatusValid(userTracking.status))
                errorMessages.push("Invalid status provided.");
            if (!result)
                errorMessages.push(message);
        }
        const successResponse = { result: true, message: "" };
        const failedResponse = { result: false, message: errorMessages.join() };
        return errorMessages.length === 0 ? successResponse : failedResponse;
    }
    async getUsersDiscordDataIndex() {
        try {
            const usersData = await this.discordRepository.getUsersDiscordData();
            const usersIndex = usersData.filter(({ discordUserId }) => discordUserId != null)
                .reduce((allUsers, { userId, discordUserId }) => {
                return Object.assign(Object.assign({}, allUsers), { [userId]: discordUserId });
            }, {});
            return { response: new ApiResponse_1.ApiResponse(true, { usersIndex }) };
        }
        catch (err) {
            return { err };
        }
    }
    async addUsersTracking(data) {
        try {
            const usersTracking = data.usersTracking;
            const { result, message } = DiscordService.areUserTrackingInputsValid(usersTracking);
            if (!result)
                return { err: new CustomError_1.CustomError(message) };
            const addedUsersTracking = await this.discordRepository.addUsersTracking(usersTracking);
            return { response: new ApiResponse_1.ApiResponse(true, { usersTracking: addedUsersTracking }) };
        }
        catch (err) {
            return { err };
        }
    }
    async getUserLastDiscordTrack() {
        try {
            const usersLastTrack = await this.discordRepository.getUsersDiscordLastTrack();
            return { response: new ApiResponse_1.ApiResponse(true, { usersLastTrack }) };
        }
        catch (err) {
            return { err };
        }
    }
    async getDiscordChannelsData() {
        try {
            const discordChannelsData = await this.discordRepository.findChannels();
            return { response: new ApiResponse_1.ApiResponse(true, { discordChannelsData }) };
        }
        catch (err) {
            return { err };
        }
    }
    async areUsersValid(userIds) {
        try {
            if (userIds.length === 0)
                return { err: new CustomError_1.CustomError("Invalid value for userIds.") };
            const userLastTrackRows = await this.discordRepository.getUsersDiscordLastTrack(userIds);
            if (userLastTrackRows == null || userLastTrackRows.length !== userIds.length)
                return { err: new CustomError_1.CustomError("User not found.") };
            const invalidUsers = userLastTrackRows.filter(({ status }) => status !== Constants_1.Constants.DISCORD_MEMBER_ACTIVE_STATUS);
            if (invalidUsers.length !== 0)
                return { err: new CustomError_1.CustomError(`Invalid users: ${invalidUsers.map(({ id, status }) => `[${id}: ${status}]`).join()}`) };
            return { response: new ApiResponse_1.ApiResponse(true, { areUsersValid: true }) };
        }
        catch (err) {
            return { err };
        }
    }
    async getUsersPreMeetingTracking(meetingId) {
        try {
            if (meetingId == null)
                return { err: new CustomError_1.CustomError("Meeting id must be provided") };
            const usersTracking = await this.discordRepository.findUsersTrackPreMeeting(meetingId);
            return { response: new ApiResponse_1.ApiResponse(true, { usersTracking }) };
        }
        catch (err) {
            return { err };
        }
    }
}
exports.DiscordService = DiscordService;
//# sourceMappingURL=DiscordService.js.map