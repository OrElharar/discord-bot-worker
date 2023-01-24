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
exports.DiscordRepository = void 0;
const EntityRepository_1 = require("./EntityRepository");
const userTrackingQueries = __importStar(require("../helpers/postgresQueriesHelper/userTracking"));
const PostgresAdapter_1 = require("../storage/PostgresAdapter");
class DiscordRepository extends EntityRepository_1.EntityRepository {
    constructor() {
        super();
        this.pgClient = PostgresAdapter_1.PgClient;
    }
    async getUsersDiscordData() {
        const selectUsersDiscordDataQuery = userTrackingQueries.getSelectUsersDiscordDataQuery();
        const values = [];
        const response = await this.pgClient.callDbCmd(selectUsersDiscordDataQuery, values);
        return response.rows;
    }
    async addUsersTracking(usersTrackingList) {
        const insertUserTrackingQueriesBucket = [];
        const insertUserTrackingValuesBucket = [];
        const insertUserTrackingQuery = userTrackingQueries.getInsertUserTrackingQuery();
        usersTrackingList.forEach((data) => {
            insertUserTrackingQueriesBucket.push(insertUserTrackingQuery);
            insertUserTrackingValuesBucket.push([data.userId, data.discordChannelId, data.status, data.meetingId]);
        });
        const response = await this.pgClient.callDbTransaction(insertUserTrackingQueriesBucket, insertUserTrackingValuesBucket);
        const addedUsersTracking = [];
        for (let i = 0; i < insertUserTrackingQueriesBucket.length; i++)
            if (response[i].rowCount > 0)
                addedUsersTracking.push(response[i].rows[0]);
        return addedUsersTracking;
    }
    async getUsersDiscordLastTrack(userIds = null) {
        const selectUsersDiscordLastTrackQuery = userTrackingQueries.getSelectDiscordUserLastTrackQuery();
        const values = [userIds];
        const response = await this.pgClient.callDbCmd(selectUsersDiscordLastTrackQuery, values);
        return response.rows;
    }
    async findUsersTrackPreMeeting(meetingId) {
        const selectUsersDiscordLastTrackQuery = userTrackingQueries.getSelectPreMeetingUserTrackQuery();
        const values = [meetingId];
        const response = await this.pgClient.callDbCmd(selectUsersDiscordLastTrackQuery, values);
        return response.rows;
    }
    async findChannels() {
        const SelectDiscordChannelsDataQuery = userTrackingQueries.getSelectDiscordChannelsQuery();
        const values = [];
        const response = await this.pgClient.callDbCmd(SelectDiscordChannelsDataQuery, values);
        return response.rows;
    }
}
exports.DiscordRepository = DiscordRepository;
//# sourceMappingURL=DiscordRepository.js.map