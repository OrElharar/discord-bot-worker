import {ChannelType, Client, Collection, GuildMember, Message} from "discord.js";
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
        const {err: serviceErr } = await this.discordService.addUsersTracking({usersTracking: [{
                userId, discordChannelId: channel.id, status: Constants.USER_TRACKING_STUDY_LABEL
            }]});
        if(serviceErr)
            return this.error(serviceErr);
        console.log(`DiscordEventsHandler added addUsersTracking for user ${userId}.`)
    }

    async newMessage(msg: Message){
        try {
            console.log(msg)
            const content = Validations.isJsonValid(msg.content) ? JSON.parse(msg.content) : msg.content;
            // if (msg.content === "PING")
            //     msg.channel.send("PONG")

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
    error(err: Error){
        console.log(`Discord Error: ${err.message}`);
    }

    async login() {
        this.client.login(process.env.DISCORD_BOT_TOKEN)
            .then(()=> this.addEventsListener())
            .catch((err)=> {
                console.log("login to Discord bot Failed, trying again...", err)
                this.login()
            })
    }

    addEventsListener(): void{
        this.client.on('ready', async () => {
            await this.ready();
        });

        this.client.on("error", (err)=>{
            this.error(err);
        })

        this.client.on("messageCreate", async (msg )=>{
            await this.newMessage(msg)
        })
    }

    run() :void{
        this.login().then(()=>console.log("Login successfully to Discord bot"))
    }
}



