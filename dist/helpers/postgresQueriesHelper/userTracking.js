"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelectUsersDiscordDataQuery = exports.getInsertUserTrackingQuery = void 0;
function getInsertUserTrackingQuery() {
    return `insert into user_tracking_history (user_id, discord_channel_id, status) values ($1, $2, $3);`;
}
exports.getInsertUserTrackingQuery = getInsertUserTrackingQuery;
function getSelectUsersDiscordDataQuery() {
    return `select id as "userId", discord_user_id as "discordUserId" from users`;
}
exports.getSelectUsersDiscordDataQuery = getSelectUsersDiscordDataQuery;
//# sourceMappingURL=userTracking.js.map