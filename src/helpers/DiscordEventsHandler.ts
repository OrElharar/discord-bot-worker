import {ChannelType, Client, Collection, GuildMember, Message} from "discord.js";
import {Constants} from "./ConstantsHelper";
import {Validations} from "./ValidationsHelper";
import {DiscordService} from "../services/DiscordService";

type ContentType = {
    type: string,
    data: any
}

export class DiscordEventsHandler {
    static discordService = DiscordService;
    static usersIndex :Record<string, string> = {};

   static async ready(client: Client){
       console.log(`Logged in as ${client.user.tag}, Ready to go`);
       const {err, response} = await this.discordService.getUsersDiscordDataIndex();
       if(err)
           this.error(err);
       else{
           // this.usersIndex = response.data.usersIndex
           this.usersIndex = response.data["usersIndex"];
       }
       const guild = client.guilds.cache.get(process.env.GUILD_ID);
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

   static error(err: Error){
       console.log(`Discord Error: ${err.message}`);
   }
   static async createNewChannel(msg: Message, content :ContentType){
       const channel = await msg.guild.channels.create({
           name: content.data.channelName,
           type: Constants.DISCORD_VOICE_CHANNEL_INDEX_TYPE
       });
       console.log(`Created channel ${channel.name} successfully`)
   }

   static async moveMember(msg: Message, content: ContentType){
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
   static async newMessage(msg: Message){
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
}
