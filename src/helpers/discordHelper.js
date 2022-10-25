const { Client, IntentsBitField, ChannelType, GuildChannel, GatewayIntentBits} = require('discord.js');
const axios = require('axios');
const ApiResponse = require("../models/ApiResponse");
const  globals = require("../helpers/globalsHelper");
const BotInstructions = require("../models/BotInstructions");
const CustomError = require("../models/CustomError");

const client = new Client({ intents: [IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        GatewayIntentBits.GuildMembers] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}, Ready to go`);
});

client.on("error", (err)=>{
    console.log(`Discord Error: ${err.message}`);
})

client.on("messageCreate", async (msg)=>{
    try {
        const userId = msg.content
        const member = msg.mentions.members.first();
        console.log({member});
        const channelId = msg.guild.channels.cache.find(channel => channel.name === "the voice channel");
        const res = await member.voice.setChannel(channelId);
        console.log({res})
        console.log({userId})
        msg.content = isJsonValid(msg.content) ? JSON.parse(msg.content) : msg.content;
        if (msg.content === "PING")
            msg.channel.send("PONG")
        // if(msg.author.id !== process.env.DISCORD_WEBHOOK_USER_ID)
        //     return
        if (msg.content.type === globals.CREATE_NEW_CHANNEL_MSG) {
            const channel = await msg.guild.channels.create({
                name: msg.content.data.channelName,
                type: 2
            });
            console.log(`Created channel ${channel.name} successfully`)
        }
        // console.log(msg)
        if(msg.content.type === "$move"){
            console.log("In $move")
            console.log({msg})
            const member = msg.mentions.users.first();
            console.log({member});
            member.voice.setChannel("The Voice Channel")
            // const channels = await msg.guild.channels.fetch();
            // const VCchannel = msg.guild.channels.cache.find(channel => channel.name === "the voice channel");

            // channels.forEach(async(channel)=> {
            //     console.log("In channels.forEach");
            //     const members = await channel.guild.members.fetch();
            //     console.log({members})
            //     members.forEach(async(member)=>{
            //         await member.voice.setChannel(VCchannel)
            //     })
            // })
            // const members = await channels[0].guild.members.fetch();
            // console.log({members});
        }

    }catch(err){
        console.log(err.message);
    }
})


module.exports.sendCreateChannelMsg = async(channelName)=>{
    try{
        if (channelName == null)
            return {err: new CustomError("Channel's name must be provided")}
        const msg = new BotInstructions(globals.CREATE_NEW_CHANNEL_MSG, { channelName })
        await axios.post(process.env.DISCORD_WEBHOOK_URL, {content: JSON.stringify(msg)});
        return {response: new ApiResponse(true)}
    }catch (err){
        return {err}
    }
}

module.exports.sendCMoveMemberMsg = async(channelName, userId)=>{
    try{
        if (userId == null)
            return {err: new CustomError("User's id must be provided")}
        const msg = new BotInstructions("$move", { channelName, userId })
        await axios.post(process.env.DISCORD_WEBHOOK_URL, {content: JSON.stringify(msg)});
        return {response: new ApiResponse(true)}
    }catch (err){
        return {err}
    }
}

module.exports.sendMessage = async(message)=>{
    try{
        await axios.post(process.env.DISCORD_WEBHOOK_URL, {content: message});
        return {response: new ApiResponse(true)}
    }catch (err){
        return {err}
    }
}



const isJsonValid = (value)=>{
    try{
        JSON.parse(value);
        return true;
    }catch(err){
        return false;
    }
}

const login = async()=>{
    client.login(process.env.DISCORD_BOT_TOKEN)
        .then()
        .catch((err)=> {
            console.log("login to Discord bot Failed, trying again...", err)
            login().then()
        })
}

login().then(()=> console.log("Login successfully to Discord bot"))