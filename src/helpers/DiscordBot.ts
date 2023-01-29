import {
    ChannelType,
    Client,
    Collection,
    GuildMember,
    Message,
    TextChannel,
    VoiceState
} from "discord.js";

import {DiscordService, Constants, Validations, Logger} from "../studentcher-shared-utils";
import logger from "./Logger";
import {RedisAdapter} from "../studentcher-shared-utils/storage/RedisAdapter";

type ContentType = {
    type: string,
    data: any
}

export class DiscordBot{
    private client: Client;
    private  usersIndex : Record<string, string>;
    private  membersIndex : Record<string, string>;
    private discordService :DiscordService;
    private logger : Logger;
    private redisClient: RedisAdapter

    constructor(client: Client) {
        this.client = client;
        this.discordService = new DiscordService();
        this.usersIndex = {};
        this.membersIndex = {};
        this.logger = logger;
        this.redisClient = new RedisAdapter({
                host: process.env.REDIS_ADDRESS,
                port: parseInt(process.env.REDIS_PORT)},
            logger)
    }

    async loadUsersIndexes(){
        const {err, response} = await this.discordService.getUsersDiscordDataIndex();
        if(err) {
            this.error(err);
            return
        }
        this.usersIndex = response.data["usersIndex"];
        for(let userId in this.usersIndex){
            const memberId = this.usersIndex[userId];
            this.membersIndex[memberId] = userId;
        }
        this.logger.info(JSON.stringify(this.usersIndex))
    }
    async ready(){
        this.logger.info(`Logged in as ${this.client.user.tag}, Ready to go`);
        await this.loadUsersIndexes();
        const guild = this.client.guilds.cache.get(process.env.GUILD_ID);
        const usersToBan = [];
        const usersTrackingList = [];
        const loggedInUsers: Record<string, boolean> = {}
        guild.channels.cache
            .filter(channel => ChannelType[channel.type] === Constants.DISCORD_VOICE_CHANNEL_TYPE)
            .forEach((channel)=>{
                const members : any = Array.from(channel.members as Collection<string, GuildMember>);
                for (const [memberId, _value ] of members) {
                    const userId = this.membersIndex[memberId];
                    if(userId == null) {
                        usersToBan.push(memberId)
                        continue;
                    }
                    usersTrackingList.push({ userId, discordChannelId: channel.id, status: Constants.DISCORD_MEMBER_ACTIVE_STATUS })
                    loggedInUsers[userId] = true;
                }
            });
        for(const userId in this.usersIndex)
            if(!loggedInUsers[userId])
                usersTrackingList.push({ userId, discordChannelId: null, status: Constants.DISCORD_MEMBER_LEFT_STATUS })
        // TODO - add logic to ban "usersToBan"
        const {err: serviceErr } = await this.discordService.addUsersTracking({usersTracking: usersTrackingList});
        if(serviceErr)
            return this.error(serviceErr);
        this.logger.info(`DiscordEventsHandler added addUsersTracking for #${usersTrackingList.length} users.`)

    }

    async moveMember(msg: Message, content: ContentType){
        // this.logger.debug(content.data)
        const usersTracking = content?.data?.usersTracking;
        this.logger.debug(JSON.stringify(usersTracking))
        if(usersTracking == null)
            return this.error(new Error("usersTracking was not provided in "));
        const {err} = await this.discordService.addUsersTracking({usersTracking});
        if(err)
            return this.error(err);
        for (let i = 0; i < usersTracking.length; i++ ){
            const {userId, discordChannelId} = usersTracking[i]
            const discordUserId = this.usersIndex[userId];
            const member= msg.guild.members.cache.get(discordUserId)
            if(member == null) {
                this.logger.warn(JSON.stringify({userId, discordUserId, discordChannelId}));
                this.error(new Error("Member was not found"))
                return;
            }
            await member.voice.setChannel(discordChannelId);
            this.logger.info(`DiscordBot set channel for ${userId}, to be: ${discordChannelId}.`);
        }

    }

    async newMessage(msg: Message){
        try {
            const content = Validations.isJsonValid(msg.content) ? JSON.parse(msg.content) : msg.content;
            // if (msg.content === "PING")
            //     msg.channel.send("PONG")
            if(content.type == null)
                return;
            // this.logger.debug(JSON.stringify(msg))
            if (content.type === Constants.CREATE_NEW_CHANNEL_MSG) {
                await this.createNewChannel(msg, content);
                return;
            }
            if(content.type === Constants.MOVE_MEMBER_MSG){
                await this.moveMember(msg, content);
                return;
            }

        }catch(err){
            this.error(err);
        }
    }

    async createNewChannel(msg: Message, content :ContentType){
        await msg.guild.channels.create({
            name: content.data.channelName,
            type: Constants.DISCORD_VOICE_CHANNEL_INDEX_TYPE
        });
        this.logger.info(`Created channel ${content.data.channelName} successfully`)
    }

    async memberLoginHandler(member : GuildMember): Promise<void>{
        this.logger.info(`New member logged in the server, id: ${member.user.id}, name: ${member.user.username}`)
        const channel = member.guild.channels.cache.find(channel => channel.name === "lobby");
        if(channel == null){
            this.logger.error(`Channel lobby not found`)
            return;
        }

        // TODO -
        //  Add the user to the voice channel - Seems impossible - need to solve;
        if(channel instanceof TextChannel)
            await channel.send(`Hey ${member.user.username}, Please Enter the Classroom`);
    }

    async memberTrackingHandler(member: GuildMember, voiceChannelId: string , status: string) :Promise<void>{
        this.logger.info(`Member id: ${member.user.id}, name: ${member.user.username}, joined VoiceChannel`)
        const discordUserId = member.user.id;
        const userId = this.membersIndex[discordUserId];
        const usersTracking = [{userId, discordChannelId: voiceChannelId, status }]
        const {err: serviceErr, response } = await this.discordService.addUsersTracking({usersTracking});
        if(serviceErr)
            return this.error(serviceErr);
        this.logger.info(`DiscordEventsHandler added addUsersTracking for user ${userId}.`);
        this.logger.debug(`usersTracking response - ${JSON.stringify(response?.data?.usersTracking)}`)
        for (const userTrack of response.data.usersTracking) {
            const message = JSON.stringify({userTrack});
            await this.redisClient.publish(Constants.STUDY_CHANNELS_SUBSCRIPTION, message);
        }
    }

    error(err: Error | unknown){
        const defaultError =  new Error("Error");
        const error: Error = err instanceof Error ? err : defaultError;
        this.logger.error(error.message);
    }

    async run(): Promise<void>{
        try{
            this.logger.info("Starting DiscordBot...");
            await this.client.login(process.env.DISCORD_BOT_TOKEN);
            this.logger.info("Logged in, " + this.client.isReady())
            this.client.on('ready', async () => {
                try {
                    await this.ready();
                }catch (err){
                    this.error(err)
                }
            });

            this.client.on("messageCreate", async (msg )=>{
                try{
                    await this.newMessage(msg)
                }catch (err){
                    this.error(err)
                }
            })

            this.client.on('guildMemberAdd', async (member) => {
                try{
                    await this.memberLoginHandler(member);
                }catch (err){
                    this.error(err)
                }
            });

            this.client.on('voiceStateUpdate', async(oldState: VoiceState, newState: VoiceState) => {
                const oldChannel = oldState?.channel;
                const newChannel = newState?.channel;
                this.logger.info(`Fired voiceStateUpdate. newChannelExist: ${newChannel  !=null}, oldChannelExist: ${oldChannel!=null}`)

                // if(oldChannel?.id === newChannel?.id)
                //     return;
                try {
                    const member = newChannel != null ? newState.member : oldState.member;
                    const channelId = newChannel != null ? newState.channel.id : null
                    const isMemberStudying = newChannel != null;
                    const isMemberEnteredNow = oldChannel == null;
                    const status = isMemberStudying ?
                        isMemberEnteredNow ? Constants.DISCORD_MEMBER_ACTIVE_STATUS: null :
                        Constants.DISCORD_MEMBER_LEFT_STATUS;
                    await this.memberTrackingHandler(member, channelId, status)
                }catch (err){
                    this.error(err)
                }
            });

            this.client.on("error", (err)=>{
                this.error(err);
            })

        }catch (err){
            this.logger.error("DiscordBot run failed, trying again...")
            this.error(err);
            this.run();
        }
    }

}



