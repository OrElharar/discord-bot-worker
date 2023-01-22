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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordRepository = void 0;
const postgresAdapter_1 = __importDefault(require("../storage/postgresAdapter"));
const EntityRepository_1 = require("./EntityRepository");
const userTrackingQueries = __importStar(require("../helpers/postgresQueriesHelper/userTracking"));
class DiscordRepository extends EntityRepository_1.EntityRepository {
    constructor() {
        super();
        this.pgClient = postgresAdapter_1.default;
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
            insertUserTrackingValuesBucket.push([data.userId, data.discordChannelId, data.status]);
        });
        await this.pgClient.callDbTransaction(insertUserTrackingQueriesBucket, insertUserTrackingValuesBucket);
    }
}
exports.DiscordRepository = DiscordRepository;
//# sourceMappingURL=DiscordRepository.js.map