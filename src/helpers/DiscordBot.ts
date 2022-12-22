import {
    ChannelType,
    Client,
    Collection,
    GuildMember,
    Message,
    TextChannel,
    VoiceBasedChannel,
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
    private discordService :DiscordService;

    constructor(client: Client) {
        this.client = client;
        this.discordService = new DiscordService()
    }

    async loadUsersIndex(){
        const {err, response} = await this.discordService.getUsersDiscordDataIndex();
        if(err) {
            this.error(err);
            return
        }
        this.usersIndex = response.data["usersIndex"];
        console.log(JSON.stringify(this.usersIndex))
    }
    async ready(){
        console.log(`Logged in as ${this.client.user.tag}, Ready to go`);
        await this.loadUsersIndex();
        const guild = this.client.guilds.cache.get(process.env.GUILD_ID);
        const usersToBan = [];
        const usersTrackingList = [];
        guild.channels.cache
            .filter(channel => ChannelType[channel.type] === Constants.DISCORD_VOICE_CHANNEL_TYPE)
            .forEach((channel)=>{
                const members : any = Array.from(channel.members as Collection<string, GuildMember>);
                for (const [memberId, _value ] of members) {
                    if(this.usersIndex[memberId] == null)
                        usersToBan.push(memberId);
                    else
                        usersTrackingList.push({
                            userId: this.usersIndex[memberId],
                            discordChannelId: channel.id,
                            status: Constants.USER_TRACKING_STUDY_LABEL
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
        console.log(content.data)
        const discordUserId = content.data.userId.slice(2, -1);
        const member= msg.guild.members.cache.get(discordUserId)
        if(member == null) {
            console.log({err: "Member was not mentioned"});
            return;
        }
        const discordChannelId =  content.data.channelId;
        await member.voice.setChannel(discordChannelId);
        console.log(`DiscordBot set channel for user ${discordUserId}, to be: ${discordChannelId}.`);
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

    async memberTrackingHandler(member: GuildMember, voiceChannel: VoiceBasedChannel , isMemberStudying : boolean = true) :Promise<void>{
        console.log(`Member id: ${member.user.id}, name: ${member.user.username}, joined VoiceChannel`)
        const discordUserId = member.user.id;
        const userId = this.usersIndex[discordUserId];
        const status = isMemberStudying ?  Constants.USER_TRACKING_STUDY_LABEL : Constants.USER_TRACKING_BREAK_LABEL;
        const usersTracking = [{userId, discordChannelId: voiceChannel.id, status }]
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
                    const {member, channel} = newChannel != null ? newState : oldState;
                    const isMemberStudying = newChannel != null;
                    await this.memberTrackingHandler(member, channel, isMemberStudying)
                }catch (err){
                    this.error(err)
                }
            });

            this.client.on("error", (err)=>{
                this.error(err);
            })

        }catch (err){
            this.error(err)
        }
    }

}



