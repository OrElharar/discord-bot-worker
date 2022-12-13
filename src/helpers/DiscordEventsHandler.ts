import {ChannelType, Client, Collection, GuildMember, Message} from "discord.js";
import {Constants} from "./ConstantsHelper";
import {Validations} from "./ValidationsHelper";

type ContentType = {
    type: string,
    data: any
}

export class DiscordEventsHandler {
   static ready(client: Client){
       console.log(`Logged in as ${client.user.tag}, Ready to go`);
       const guild = client.guilds.cache.get(process.env.GUILD_ID);
       const channels = {};
       guild.channels.cache
           .filter(channel => ChannelType[channel.type] === Constants.DISCORD_VOICE_CHANNEL_TYPE)
           .forEach((channel)=>{
               const memberIds :string[] = [];
               const members : any = Array.from(channel.members as Collection<string, GuildMember>);
               for (const [memberId, _value ] of members) {
                   memberIds.push((memberId as string))
                   // _value.user.email().then((e)=>{})
               }
               channels[channel.id] = {id: channel.id, name: channel.name, memberIds}
           });
       console.log({channels})
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
       const channelId = msg.guild.channels.cache.find(channel => channel.name === content.data.channelName);
       if(channelId == null){
           console.log(`Channel : ${content.data.channelName} not found`);
           return;
       }
       await member.voice.setChannel(channelId.id);
       console.log({channelId:channelId.id})
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
