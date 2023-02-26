"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
class Constants {
}
exports.Constants = Constants;
Constants.PROXY_AUTHORIZED_HEADER = "proxy-auth";
Constants.DISCORD_MEMBER_ACTIVE_STATUS = "active";
Constants.DISCORD_MEMBER_BUSY_STATUS = "busy";
Constants.DISCORD_MEMBER_BREAK_STATUS = "break";
Constants.DISCORD_MEMBER_LEFT_STATUS = "left";
Constants.CREATE_NEW_CHANNEL_MSG = "$create";
Constants.MOVE_MEMBER_MSG = "$move";
Constants.DISCORD_VOICE_CHANNEL_TYPE = "GuildVoice";
Constants.DISCORD_VOICE_CHANNEL_INDEX_TYPE = 2;
Constants.AUTHENTICATION_FAILED_MESSAGE = "Access denied";
Constants.TOKEN_EXPIRES_IN_NUMBER_OF_SECONDS = 12 * 60 * 60;
Constants.TEMP_TOKEN_EXPIRES_IN_NUMBER_OF_SECONDS = 1 * 60 * 60;
Constants.AUTHENTICATION_PASSWORD_FAILED_MESSAGE = 'Your login details could not be verified. Please try again.';
Constants.AUTHENTICATION_MISSING_PARAMS_MESSAGE = "missing params - username + password. ";
Constants.permissions = {
    userManagement: "user_management_enabled",
    activityManagementEnabled: "activity_management_enabled",
    studyPlanManagement: "plan_management_enabled",
    roleManagement: "role_management_enabled",
    activityTrackingEnabled: "activity_tracking_enabled",
    liveSubscription: "live_subscription",
    appPanelEnabled: "app_panel_enabled",
    quizzesManagementEnabled: "quizzes_management_enabled"
};
Constants.STUDY_CHANNELS_SUBSCRIPTION = "study_channels_subscription";
Constants.votesSumDeltaAllowValues = [1, -1];
Constants.CLOUD_STORAGE_PRE_SIGNED_URL_READ_ACTION = "READ";
Constants.CLOUD_STORAGE_PRE_SIGNED_URL_WRITE_ACTION = "WRITE";
//# sourceMappingURL=Constants.js.map