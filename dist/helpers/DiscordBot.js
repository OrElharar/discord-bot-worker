"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordBot = void 0;
const discord_js_1 = require("discord.js");
const studentcher_shared_utils_1 = require("../studentcher-shared-utils");
const Logger_1 = __importDefault(require("./Logger"));
const RedisAdapter_1 = require("../studentcher-shared-utils/storage/RedisAdapter");
class DiscordBot {
    constructor(client) {
        this.client = client;
        this.discordService = new studentcher_shared_utils_1.DiscordService();
        this.usersIndex = {};
        this.membersIndex = {};
        this.logger = Logger_1.default;
        this.redisClient = new RedisAdapter_1.RedisAdapter({
            host: process.env.REDIS_ADDRESS,
            port: parseInt(process.env.REDIS_PORT)
        }, Logger_1.default);
    }
    async loadUsersIndexes() {
        const { err, response } = await this.discordService.getUsersDiscordDataIndex();
        if (err) {
            this.error(err);
            return;
        }
        this.usersIndex = response.data["usersIndex"];
        for (let userId in this.usersIndex) {
            const memberId = this.usersIndex[userId];
            this.membersIndex[memberId] = userId;
        }
        this.logger.info(JSON.stringify(this.usersIndex));
    }
    async ready() {
        this.logger.info(`Logged in as ${this.client.user.tag}, Ready to go`);
        await this.loadUsersIndexes();
        const guild = this.client.guilds.cache.get(process.env.GUILD_ID);
        const usersToBan = [];
        const usersTrackingList = [];
        guild.channels.cache
            .filter(channel => discord_js_1.ChannelType[channel.type] === studentcher_shared_utils_1.Constants.DISCORD_VOICE_CHANNEL_TYPE)
            .forEach((channel) => {
            const members = Array.from(channel.members);
            for (const [memberId, _value] of members) {
                const userId = this.membersIndex[memberId];
                if (userId == null)
                    usersToBan.push(memberId);
                else
                    usersTrackingList.push({
                        userId,
                        discordChannelId: channel.id,
                        status: studentcher_shared_utils_1.Constants.DISCORD_MEMBER_ACTIVE_STATUS
                    });
            }
        });
        // TODO - add logic to ban "usersToBan"
        if (usersTrackingList.length == 0)
            return;
        const { err: serviceErr } = await this.discordService.addUsersTracking({ usersTracking: usersTrackingList });
        if (serviceErr)
            return this.error(serviceErr);
        this.logger.info(`DiscordEventsHandler added addUsersTracking for #${usersTrackingList.length} users.`);
    }
    async moveMember(msg, content) {
        var _a;
        // this.logger.debug(content.data)
        const usersTracking = (_a = content === null || content === void 0 ? void 0 : content.data) === null || _a === void 0 ? void 0 : _a.usersTracking;
        if (usersTracking == null)
            return this.error(new Error("usersTracking was not provided in "));
        const { err } = await this.discordService.addUsersTracking({ usersTracking });
        if (err)
            return this.error(err);
        for (let i = 0; i < usersTracking.length; i++) {
            const { userId, discordChannelId } = usersTracking[i];
            const discordUserId = this.usersIndex[userId];
            const member = msg.guild.members.cache.get(discordUserId);
            if (member == null) {
                this.error(new Error("Member was not found"));
                return;
            }
            await member.voice.setChannel(discordChannelId);
            this.logger.info(`DiscordBot set channel for ${userId}, to be: ${discordChannelId}.`);
        }
    }
    async newMessage(msg) {
        try {
            const content = studentcher_shared_utils_1.Validations.isJsonValid(msg.content) ? JSON.parse(msg.content) : msg.content;
            // if (msg.content === "PING")
            //     msg.channel.send("PONG")
            if (content.type == null)
                return;
            // this.logger.debug(JSON.stringify(msg))
            if (content.type === studentcher_shared_utils_1.Constants.CREATE_NEW_CHANNEL_MSG) {
                await this.createNewChannel(msg, content);
                return;
            }
            if (content.type === studentcher_shared_utils_1.Constants.MOVE_MEMBER_MSG) {
                await this.moveMember(msg, content);
                return;
            }
        }
        catch (err) {
            this.error(err);
        }
    }
    async createNewChannel(msg, content) {
        await msg.guild.channels.create({
            name: content.data.channelName,
            type: studentcher_shared_utils_1.Constants.DISCORD_VOICE_CHANNEL_INDEX_TYPE
        });
        this.logger.info(`Created channel ${content.data.channelName} successfully`);
    }
    async memberLoginHandler(member) {
        this.logger.info(`New member logged in the server, id: ${member.user.id}, name: ${member.user.username}`);
        const channel = member.guild.channels.cache.find(channel => channel.name === "lobby");
        if (channel == null) {
            this.logger.error(`Channel lobby not found`);
            return;
        }
        // TODO -
        //  Add the user to the voice channel - Seems impossible - need to solve;
        if (channel instanceof discord_js_1.TextChannel)
            await channel.send(`Hey ${member.user.username}, Please Enter the Classroom`);
    }
    async memberTrackingHandler(member, voiceChannelId, status) {
        this.logger.info(`Member id: ${member.user.id}, name: ${member.user.username}, joined VoiceChannel`);
        const discordUserId = member.user.id;
        const userId = this.membersIndex[discordUserId];
        const usersTracking = [{ userId, discordChannelId: voiceChannelId, status }];
        const { err: serviceErr, response } = await this.discordService.addUsersTracking({ usersTracking });
        if (serviceErr)
            return this.error(serviceErr);
        this.logger.info(`DiscordEventsHandler added addUsersTracking for user ${userId}.`);
        for (const userTrack of response.data.usersTracking) {
            const message = JSON.stringify({ userTrack });
            await this.redisClient.publish(studentcher_shared_utils_1.Constants.STUDY_CHANNELS_SUBSCRIPTION, message);
        }
    }
    error(err) {
        const defaultError = new Error("Error");
        const error = err instanceof Error ? err : defaultError;
        this.logger.error(error.message);
    }
    async run() {
        try {
            this.logger.info("Starting DiscordBot...");
            await this.client.login(process.env.DISCORD_BOT_TOKEN);
            this.logger.info("Logged in, " + this.client.isReady());
            this.client.on('ready', async () => {
                try {
                    await this.ready();
                }
                catch (err) {
                    this.error(err);
                }
            });
            this.client.on("messageCreate", async (msg) => {
                try {
                    await this.newMessage(msg);
                }
                catch (err) {
                    this.error(err);
                }
            });
            this.client.on('guildMemberAdd', async (member) => {
                try {
                    await this.memberLoginHandler(member);
                }
                catch (err) {
                    this.error(err);
                }
            });
            this.client.on('voiceStateUpdate', async (oldState, newState) => {
                const oldChannel = oldState === null || oldState === void 0 ? void 0 : oldState.channel;
                const newChannel = newState === null || newState === void 0 ? void 0 : newState.channel;
                this.logger.info(`Fired voiceStateUpdate. newChannelExist: ${newChannel != null}, oldChannelExist: ${oldChannel != null}`);
                if ((oldChannel === null || oldChannel === void 0 ? void 0 : oldChannel.id) === (newChannel === null || newChannel === void 0 ? void 0 : newChannel.id))
                    return;
                try {
                    const member = newChannel != null ? newState.member : oldState.member;
                    const channelId = newChannel != null ? newState.channel.id : null;
                    const isMemberStudying = newChannel != null;
                    const isMemberEnteredNow = oldChannel == null;
                    const status = isMemberStudying ?
                        isMemberEnteredNow ? studentcher_shared_utils_1.Constants.DISCORD_MEMBER_ACTIVE_STATUS : null :
                        studentcher_shared_utils_1.Constants.DISCORD_MEMBER_LEFT_STATUS;
                    await this.memberTrackingHandler(member, channelId, status);
                }
                catch (err) {
                    this.error(err);
                }
            });
            this.client.on("error", (err) => {
                this.error(err);
            });
        }
        catch (err) {
            this.logger.error("DiscordBot run failed, trying again...");
            this.error(err);
            this.run();
        }
    }
}
exports.DiscordBot = DiscordBot;
//# sourceMappingURL=DiscordBot.js.map