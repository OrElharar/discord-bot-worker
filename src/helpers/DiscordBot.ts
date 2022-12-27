import {
    ChannelType,
    Client,
    Collection,
    GuildMember,
    Message,
    TextChannel,
    VoiceState
} from "discord.js";

import {DiscordService} from "../services/DiscordService";
import {Constants} from "./ConstantsHelper";
import {Validations} from "./ValidationsHelper";

type ContentType = {
    type: string,
    data: any
}

export class DiscordBot{
    private client: Client;
    private  usersIndex : Record<string, string>;
    private  membersIndex : Record<string, string>;
    private discordService :DiscordService;

    constructor(client: Client) {
        this.client = client;
        this.discordService = new DiscordService();
        this.usersIndex = {};
        this.membersIndex = {};
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
        console.log(JSON.stringify(this.usersIndex))
    }
    async ready(){
        console.log(`Logged in as ${this.client.user.tag}, Ready to go`);
        await this.loadUsersIndexes();
        const guild = this.client.guilds.cache.get(process.env.GUILD_ID);
        const usersToBan = [];
        const usersTrackingList = [];
        guild.channels.cache
            .filter(channel => ChannelType[channel.type] === Constants.DISCORD_VOICE_CHANNEL_TYPE)
            .forEach((channel)=>{
                const members : any = Array.from(channel.members as Collection<string, GuildMember>);
                for (const [memberId, _value ] of members) {
                    const userId = this.membersIndex[memberId];
                    if(userId == null)
                        usersToBan.push(memberId);
                    else
                        usersTrackingList.push({
                            userId,
                            discordChannelId: channel.id,
                            status: Constants.DISCORD_MEMBER_ACTIVE_STATUS
                        })
                }
            });
        // TODO - add logic to ban "usersToBan"
        if(usersTrackingList.length == 0)
            return;
        const {err: serviceErr } = await this.discordService.addUsersTracking({usersTracking: usersTrackingList});
        if(serviceErr)
            return this.error(serviceErr);
        console.log(`DiscordEventsHandler added addUsersTracking for #${usersTrackingList.length} users.`)

    }

    async moveMember(msg: Message, content: ContentType){
        console.log(content.data);
        const usersTracking = content?.data?.usersTracking;
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
                console.log({err: "Member was not found"});
                return;
            }
            await member.voice.setChannel(discordChannelId);
            console.log(`DiscordBot set channel for ${userId}, to be: ${discordChannelId}.`);
        }

    }

    async newMessage(msg: Message){
        try {
            const content = Validations.isJsonValid(msg.content) ? JSON.parse(msg.content) : msg.content;
            // if (msg.content === "PING")
            //     msg.channel.send("PONG")
            if(content.type == null)
                return;

            console.log(msg)
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
        const channel = await msg.guild.channels.create({
            name: content.data.channelName,
            type: Constants.DISCORD_VOICE_CHANNEL_INDEX_TYPE
        });
        console.log(`Created channel ${channel.name} successfully`)
    }

    async memberLoginHandler(member : GuildMember): Promise<void>{
        console.log(`New member logged in the server, id: ${member.user.id}, name: ${member.user.username}`)
        const channel = member.guild.channels.cache.find(channel => channel.name === "lobby");
        if(channel == null){
            console.log(`Channel lobby not found`);
            return;
        }

        // TODO -
        //  Add the user to the voice channel - Seems impossible - need to solve;
        if(channel instanceof TextChannel)
            await channel.send(`Hey ${member.user.username}, Please Enter the Classroom`);
    }

    async memberTrackingHandler(member: GuildMember, voiceChannelId: string , status: string) :Promise<void>{
        console.log(`Member id: ${member.user.id}, name: ${member.user.username}, joined VoiceChannel`)
        const discordUserId = member.user.id;
        const userId = this.membersIndex[discordUserId];
        const usersTracking = [{userId, discordChannelId: voiceChannelId, status }]
        const {err: serviceErr } = await this.discordService.addUsersTracking({usersTracking});
        if(serviceErr)
            return this.error(serviceErr);
        console.log(`DiscordEventsHandler added addUsersTracking for user ${userId}.`)
    }

    error(err: Error | unknown){
        const defaultError =  new Error("Error");
        const error: Error = err instanceof Error ? err : defaultError;
        console.log(`Discord Error: ${error.message}`);
    }

    async run(): Promise<void>{
        try{
            console.log("Starting DiscordBot...");
            await this.client.login(process.env.DISCORD_BOT_TOKEN);
            console.log("Logged in", this.client.isReady())
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
                console.log(`Fired voiceStateUpdate. newChannelExist: ${newChannel  !=null}, oldChannelExist: ${oldChannel!=null}`)

                if(oldChannel?.id === newChannel?.id)
                    return;
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
            console.log("DiscordBot run failed, trying again...")
            this.error(err);
            this.run();
        }
    }

}



