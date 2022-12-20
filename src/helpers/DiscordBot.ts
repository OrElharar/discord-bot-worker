import {ChannelType, Client, Collection, GuildMember, Message, TextChannel, VoiceChannel} from "discord.js";

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
        const channel = msg.guild.channels.cache.find(channel => channel.name === content.data.channelName);
        if(channel == null){
            console.log(`Channel : ${content.data.channelName} not found`);
            return;
        }
        await member.voice.setChannel(channel.id);
        const userId = this.usersIndex[discordUserId];
        if(userId == null){
            //     TODO - Ban user
            console.log(`User ${discordUserId} is not in usersIndex and should be banned`)
        }
        const usersTracking = [{userId, discordChannelId: channel.id, status: Constants.USER_TRACKING_STUDY_LABEL }]
        const {err: serviceErr } = await this.discordService.addUsersTracking({usersTracking});
        if(serviceErr)
            return this.error(serviceErr);
        console.log(`DiscordBot on ready added addUsersTracking for user ${userId}.`)
    }

    async newMessage(msg: Message){
        try {
            const content = Validations.isJsonValid(msg.content) ? JSON.parse(msg.content) : msg.content;
            // if (msg.content === "PING")
            //     msg.channel.send("PONG")
            if(msg.type == null)
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

        // Add the user to the voice channel - Seems impossible
        // await member.voice.setChannel(channel.id);
        if(channel instanceof TextChannel)
            await channel.send(`Hey ${member.user.username}, Please Enter the Classroom`);
    }

    async memberJoinVoiceChannelHandler(member: GuildMember, voiceChannel: VoiceChannel) :Promise<void>{
        console.log(`Member id: ${member.user.id}, name: ${member.user.username}, joined VoiceChannel`)
        const discordUserId = member.user.id;
        const userId = this.usersIndex[discordUserId];
        const usersTracking = [{userId, discordChannelId: voiceChannel.id, status: Constants.USER_TRACKING_STUDY_LABEL }]
        const {err: serviceErr } = await this.discordService.addUsersTracking({usersTracking});
        if(serviceErr)
            return this.error(serviceErr);
        console.log(`DiscordEventsHandler added addUsersTracking for user ${userId}.`)
    }

    error(err: Error){
        console.log(`Discord Error: ${err.message}`);
    }

    async login() {
        return new Promise((res, _rej)=>{
            this.client.login(process.env.DISCORD_BOT_TOKEN)
                .then(()=> {
                    this.addEventsListener();
                    res()
                })
                .catch((err)=> {
                    console.log("login to Discord bot Failed, trying again...", err.message)
                    this.login()
                })
        })

    }

    addEventsListener(): void{
        console.log("Adding Events Listeners to DiscordBot...");
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

        this.client.on('guildMemberJoin', async (member, voiceChannel) => {
            try{
                // TODO - For some reason it stopped to fire, need to check why.
                console.log("guildMemberJoin EVENT FIRES")
                await this.memberJoinVoiceChannelHandler(member, voiceChannel);
            }catch (err){
                this.error(err)
            }
        });

        this.client.on("error", (err)=>{
            this.error(err);
        })
    }

    run() :void{
        console.log("Logging in Discord bot...")
        this.login()
            .then(()=>console.log("Logged in Discord bot."))
    }
}



